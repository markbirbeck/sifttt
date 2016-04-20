'use strict';
var h = require('highland');
var _ = require('lodash');
var File = require('vinyl');
var objnest = require('objnest');
var params = require('./params');

function toVinyl(obj) {
  var file = new File();
  var data = _.clone(obj);

  /**
   * Set the path of the entry to the URL property, if it exists:
   */

  file.path = data.url || '';

  /**
   * Remove the ID that comes from Google Sheets so as to avoid
   * confusion with other IDs such as those for ElasticSearch:
   */

  delete data.id;

  /**
   * Set the data properties:
   */

  file.data = data;
  file.contents = new Buffer(JSON.stringify(data));

  file.stat = {
    size: file.contents.length
  };

  return file;
}

let logWarnings = (params, data, fn) => {
  try {
    return fn(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message, data);
  }
  return data;
};

var streamFromRecipe = function(_recipe, connections, codecs, channels, _options) {

  /**
   * Merge any command-line options into the recipe. Anything with three
   * underscores (or some app-specific value) gets replaced with a '.':
   */

  var recipe = params(_recipe, (_options || {}).override, process.env.MAP_KEYS_ESCAPE_SEQUENCE);

  var _if = recipe.input || recipe.if;
  var _then = recipe.output || recipe.then;

  _if = _.merge({opts: connections[_if.channel]}, _if);
  _then = _.merge({opts: connections[_then.channel]}, _then);

  var src = channels[_if.channel].src;
  var dest = channels[_then.channel].dest;
  var codec = _if.codec && codecs && codecs[_if.codec];

  return h(src(_if.glob, _if.opts))

  /**
   * If a codec has been specified then pass the data through it. Codecs will
   * do things like split a file into rows:
   */

  .consume((err, file, push, next) => {
    if (err) {
      push(err);
      next();
    } else if (file === h.nil) {
      push(null, file);
    } else {
      if (codec) {
        codec(err, file, push, next);
      } else {
        push(null, file);
        next();
      }
    }
  })
  .map(function(file) {

    /**
     * If there is no data then convert 'contents' to JSON:
     */

    if (!file.data) {
      try {
        file.data = JSON.parse(String(file.contents));
      } catch (e) {

      }
    }
    return file;
  })
  .consume(require('./explodeArrayToVinyl')(_if, toVinyl))
  .consume(require('./runFilters')(recipe, toVinyl, logWarnings))

  /**
   * [TODO] Remove this hack. It's necessary at the moment because the filters
   * are not correctly picking up fields that are nested:
   */

  .map(function(file) {
    if (file.data) {
      var data = objnest.expand(file.data);

      /**
       * If the expansion gives us an empty object then we might be better off
       * with the original value of data:
       */

      if (!_.isEqual(data, {})) {
        file.data = data;
      }
    }
    return file;
  })
  .map(function(file) {
    if (file.data) {
      file.contents = new Buffer(JSON.stringify(file.data));
    }
    return file;
  })
  .through(dest(_then.glob, _then.opts))
  .stopOnError(err => {
    console.warn('Stopping process: unrecoverable error in destination stream:',
      err.message);
    process.exit(1);
  })
  .pipe(h())
  ;
}

module.exports = streamFromRecipe;
