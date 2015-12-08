'use strict';
var h = require('highland');
var _ = require('lodash');
var File = require('vinyl');
var objnest = require('objnest');

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

var streamFromRecipe = function(_recipe, connections, channels, _options) {

  /**
   * Merge any command-line options into the recipe:
   */

  var options = objnest.expand(_options || {});
  var recipe = _.merge(_recipe, options);

  var _if = recipe.input || recipe.if;
  var _then = recipe.output || recipe.then;

  _if = _.merge({opts: connections[_if.channel]}, _if);
  _then = _.merge({opts: connections[_then.channel]}, _then);

  var src = channels[_if.channel].src;
  var dest = channels[_then.channel].dest;

  return src(_if.glob, _if.opts)
  .pipe(h())
  .map(function(file) {

    /**
     * If there is no data then convert 'contents' to JSON:
     */

    if (!file.data) {
      file.data = JSON.parse(String(file.contents));
    }
    return file;
  })
  .consume(require('./explodeArrayToVinyl')(_if, toVinyl))
  .consume(require('./runFilters')(recipe, logWarnings, toVinyl))

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
  .pipe(dest(_then.glob, _then.opts))
  .pipe(h())
  ;
}

module.exports = streamFromRecipe;
