'use strict';
let csv = require('csv-parse/lib/sync');
let evaljson = require('evaljson');
let objectPath = require('object-path');

let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  let options = {
    columns: params.columns || [],
    delimiter: params.separator || ',',
    quote: params.quote_char || '\"',
    relax: true,
    trim: true
  };

  try {
    var val = checkForSimpleAssignment(data, params.source || '#{message}');

    if (val === null) {
      val = evaljson(params, data).source;
    }

    let newVal = csv(val, options)[0];

    if (params.target) {
      objectPath.set(data, params.target, newVal);
    } else {
      data = newVal;
    }
  } catch (e) {
    throw(new Error('Unable to parse CSV from \'' + params.source + '\': ' +
      e));
  }

  return data;
}

