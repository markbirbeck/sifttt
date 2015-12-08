'use strict';
var evaljson = require('evaljson');

var checkForSimpleAssignment = require('./../checkForSimpleAssignment');

module.exports = (params, data) => {
  if (params.source && params.target) {
    try {
      var val = checkForSimpleAssignment(data, params.source);

      if (!val) {
        val = evaljson(params, data).source;
      }

      data[params.target] = val;
    } catch (e) {
      throw(new Error('Unable to assign to \'' + params.target + '\': ' +
        e.message));
    }
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

  if (params.convert) {
    var convert = params.convert;

    Object.getOwnPropertyNames(convert).forEach(function(prop) {
      var type = convert[prop];
      var val = data[prop];
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
      data[prop] = newVal;
    })
  }

  return data;
}
