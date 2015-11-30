var h = require('highland');
var _ = require('lodash');
var File = require('vinyl');
var objnest = require('objnest');

var _geoip = require('./geoip');
var _json = require('./json');
var _mutate = require('./mutate');

function geoip(params, data) {
  try {
    return _geoip(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message, data);
  }
  return data;
}

function json(params, data) {
  try {
    return _json(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message, data);
  }
  return data;
}

function mutate(params, data) {
  try {
    return _mutate(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message, data);
  }
  return data;
}

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

var streamFromRecipe = function(recipe, connections, channels) {
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
  .consume(require('./runFilters')(recipe, geoip, json, mutate, toVinyl))

  /**
   * [TODO] Remove this hack. It's necessary at the moment because the filters
   * are not correctly picking up fields that are nested:
   */

  .map(function(file) {
    if (file.data) {
      file.data = objnest.expand(file.data);
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
