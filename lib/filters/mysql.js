'use strict';
const h = require('highland');
const evaljson = require('evaljson');
const objectPath = require('object-path');

const mysql = require('../functions/mysql');
const checkForSimpleAssignment = require('../checkForSimpleAssignment');

module.exports = (_params, data) => {
  let val = checkForSimpleAssignment(data, _params.source);
  let params = evaljson(_params, data);

  if (val === null) {
    val = params.source;
  }

  return h(mysql(val))
  .map(result => {
    objectPath.set(data, params.target, result);
    return data;
  })
  ;
}
