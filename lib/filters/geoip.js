'use strict';
var evaljson = require('evaljson');
var maxmind = require('maxmind');

let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  try {
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

    var val = checkForSimpleAssignment(data, params.source);

    if (val === null) {
      val = evaljson(params, data).source;
    }

    data[params.target] = maxmind.getLocation(val);
  } catch (e) {
    throw(new Error('Unable to get geoip for \'' + params.source + '\': ' +
      e));
  }

  return data;
}
