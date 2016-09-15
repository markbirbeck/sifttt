'use strict';
var evaljson = require('evaljson');
let objectPath = require('object-path');

var checkForSimpleAssignment = require('./../checkForSimpleAssignment');
const converters = require('../functions/convert');

module.exports = (params, data) => {
  if (params.source && params.target) {
    try {
      var val = checkForSimpleAssignment(data, params.source);

      if (val === null) {
        val = evaljson(params, data).source;
      }

      let orig = objectPath.get(data, params.target);

      if (Array.isArray(orig)) {
        orig.push(val);
      } else {
        objectPath.set(data, params.target, val);
      }
    } catch (e) {
      throw(new Error('Unable to assign to \'' + params.target + '\': ' +
        e.message));
    }
  }

  if (params.convert) {
    var convert = params.convert;

    Object.getOwnPropertyNames(convert).forEach(function(prop) {
      var type = convert[prop];
      var val = objectPath.get(data, prop);
      var newVal = converters.convert(val, type);

      objectPath.set(data, prop, newVal);
    })
  }

  if (params.removeField) {
    let fields = params.removeField;

    if (!Array.isArray(fields)) {
      fields = [fields];
    }

    fields.forEach(field => {
      delete data[field];
    });
  }

  return data;
}
