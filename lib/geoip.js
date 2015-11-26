var _ = require('lodash');
var evaljson = require('evaljson');
var maxmind = require('maxmind');

var checkForSimpleAssignment = require('./checkForSimpleAssignment');

function geoip(params, data) {
  var ret;

  try {
    var condition = checkForSimpleAssignment(data, params.if);

    if (!params.if || condition) {
      if (!params.database) {
        throw new Error('Please provide a value for the \'database\' parameter');
      }

      /**
       * Initialise MaxMind with the geo database provided:
       */

      if (!maxmind.init(
        params.database,
        {
          indexCache: true,
          checkForUpdates: true
        }
      )) {
        throw new Error('Unable to initialise MaxMind database with \'' +
          params.database + '\'');
      }

      ret = _.clone(data);
      var val = checkForSimpleAssignment(data, params.source);

      if (!val) {
        val = evaljson(params, data).source;
      }

      ret[params.target] = maxmind.getLocation(ret[val]);
    }
  } catch (e) {
    throw(new Error('Unable to get geoip for \'' + params.source + '\': ' +
      e));
  }

  return ret || data;
}

module.exports = geoip;
