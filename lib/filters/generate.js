/**
 * Generate a list of items that result in new entries in the stream.
 */

'use strict';
const _ = require('lodash');
const h = require('highland');
const evaljson = require('evaljson');
const dateGenerator = require('../generators/date');
const numberGenerator = require('../generators/number');

const checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  let val = checkForSimpleAssignment(data, params.source);

  if (val === null) {
    val = evaljson(params, data);
  }

  let start = val.start;
  let end = val.end;
  let field = val.field;
  let type = params.type;
  let generator;

  switch (type) {
    case 'date':
      generator = dateGenerator;
      break;

    case 'number':
      generator = numberGenerator;
      break;

  }

  return h(generator(start, end))
  .map(newVal => {
    let newData = _.merge({}, data);

    if (field) {
      newData[field] = newVal;
    }

    return newData;
  })
  ;
};
