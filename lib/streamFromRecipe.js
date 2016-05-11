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

  /**
   * If a codec has been specified:
   */

  let codec;
  if (_if.codec) {

    /**
     * It doesn't mean anything to have more than one codec, so use some():
     */

    Object.getOwnPropertyNames(_if.codec)
    .some(name => {
      if (!codecs) {
        console.warn(`Codec '${name}' has been specified but no codecs are defined`);
      } else {
        codec = codecs[name](_if.codec[name]);
        return true;
      }
    });
  }

  /**
   * [TODO]
   *
   * Make this neater!
   *
   * Getting fed up with trying to make the conditional part work. The idea is
   * simply that if there is a codec present then pipe everything through it,
   * but it needs to be on a per stream basis, because the codec might do
   * things like drop the first line of each stream. However, no matter what
   * I try I can't get it to work when creating one stream, so this will have
   * to do for now.
   */

  if (codec) {
    return createStreamWithCodec(recipe, codec, src, dest, _if, _then);
  } else {
    return createStream(recipe, src, dest, _if, _then);
  }
}

function createStream(recipe, src, dest, _if, _then) {
  return h(src(_if.glob, _if.opts))
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

function createStreamWithCodec(recipe, codec, src, dest, _if, _then) {
  return h(src(_if.glob, _if.opts))

  /**
   * Gulp can contain file content or a reference to a stream that will read
   * the file content...so work out which it is:
   */

  .map(file =>
    file.isStream()
      ? file.contents
      : Promise.resolve(new Buffer(file.contents))
  )

  /**
   * If a codec has been specified then pass the data through it. Codecs will
   * do things like split a file into rows. Note that we use flatMap() rather
   * than piping to the codec directly because that allows the codec to
   * perform actions on a per stream basis, such as drop the first row of each
   * file:
   */

  .flatMap(s => h(s).through(codec))

  /**
   * For each item returned create a Vinyl file object:
   */

  .map(toVinyl)
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
