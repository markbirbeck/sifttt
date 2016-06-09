'use strict';
let geohash = require('ngeohash');
let evaljson = require('evaljson');
let objectPath = require('object-path');

let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  try {
    var val = checkForSimpleAssignment(data, params.source);

    if (val === null) {
      val = evaljson(params, data).source;
    }

    let newVal = geohash.decode(val);

    /**
     * [TODO]
     *
     * Do something clever with the error value:
     */

    delete newVal.error;

    if (params.target) {
      objectPath.set(data, params.target, newVal);
    } else {
      data = newVal;
    }
  } catch (e) {
    throw(new Error('Unable to geohash \'' + params.source + '\': ' +
      e));
  }

  return data;
}

