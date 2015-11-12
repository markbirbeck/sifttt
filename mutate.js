var _ = require('lodash');
var evaljson = require('evaljson');

function mutate(params, data) {
  var ret;

  if (params.source && params.target) {
    try {
      var action = evaljson(params, data);

      ret = _.clone(data);
      ret[action.target] = action.source;
    } catch (e) {
      throw(new Error('Unable to assign to \'' + params.target + '\': ' +
        e.message));
    }
  }

  if (params.removeField) {
    ret = _.omit(data, params.removeField);
  }

  if (params.convert) {
    var convert = params.convert;
    ret = _.clone(data);

    Object.getOwnPropertyNames(convert).forEach(function(prop) {
      var type = convert[prop];
      var val = ret[prop];
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
      ret[prop] = newVal;
    })
  }

  return ret || data;
}

module.exports = mutate;
