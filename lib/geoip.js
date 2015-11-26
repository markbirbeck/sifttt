var _ = require('lodash');
var jsonPath = require('JSONPath');
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
      ret[params.target] = maxmind.getLocation(jsonPath.eval(ret, params.source)[0]);
    }
  } catch (e) {
    throw(new Error('Unable to get geoip for \'' + params.source + '\': ' +
      e));
  }

  return ret || data;
}

module.exports = geoip;
