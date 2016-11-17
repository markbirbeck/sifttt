'use strict';
const iso3166 = require('iso-3166-2');
const evaljson = require('evaljson');
const objectPath = require('object-path');

const checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  try {
    var val = checkForSimpleAssignment(data, params.source);

    if (val === null) {
      val = evaljson(params, data).source;
    }

    let newVal = iso3166.country(val).name;

    if (!newVal) {
      if (params.error) {
        objectPath.set(data, params.error, `Unable to convert country: '${val}' is not a valid ISO 3166 value.`);
      }
    } else {
      if (params.target) {
        objectPath.set(data, params.target, newVal);
      } else {
        data = newVal;
      }
    }
  } catch (e) {
    throw(new Error('Unable to convert country from ISO 3166 \'' + params.source + '\': ' +
      e));
  }

  return data;
}

