'use strict';
const evaljson = require('evaljson');
const objectPath = require('object-path');
const geocode = require('../functions/geocode');

let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (_params, data) => {
  let val = checkForSimpleAssignment(data, _params.source);
  let params = evaljson(_params, data);

  if (val === null) {
    val = params.source;
  }

  return geocode(val.address, val.provider, val.apiKey)
  .then(result => {
    objectPath.set(data, params.target, result);
    return data;
  })
  ;
}
