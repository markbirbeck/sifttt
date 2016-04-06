'use strict';
let evaljson = require('evaljson');
let objectPath = require('object-path');

let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  try {
    let val = checkForSimpleAssignment(data, params.source);

    if (val === null) {
      val = evaljson(params, data).source;
    }
    objectPath.set(data, params.target, JSON.parse(val));
  } catch (e) {
    throw(new Error('Unable to parse JSON from \'' + params.source + '\': ' +
      e));
  }

  return data;
}
