'use strict';
let evaljson = require('evaljson');
let objectPath = require('object-path');
let moment = require('../functions/moment');

let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (_params, data) => {
  try {
    let val = checkForSimpleAssignment(data, _params.source);
    let params = evaljson(_params, data);

    if (val === null) {
      val = params.source;
    }

    let newVal = moment(val, params.format, params.offset);

    objectPath.set(data, params.target, newVal);
  } catch (e) {
    throw(new Error(`Unable to calculate moment for '${_params.source}': ${e}`));
  }

  return data;
}
