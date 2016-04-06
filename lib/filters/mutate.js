'use strict';
var evaljson = require('evaljson');
let objectPath = require('object-path');

var checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  if (params.source && params.target) {
    try {
      var val = checkForSimpleAssignment(data, params.source);

      if (val === null) {
        val = evaljson(params, data).source;
      }

      objectPath.set(data, params.target, val);
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
      var newVal = val;

      switch (type) {
        case 'date':
          if (val < 10000000000) {
            val *= 1000;
          }
          newVal = (new Date(val)).toISOString();
          break;

        case 'number':
          newVal = Number(val);
          break;

        case 'string':
          newVal = String(val);
          break;

        default:
          throw(new Error('No type conversion for \'' + type + '\''));
          break;
      }
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
