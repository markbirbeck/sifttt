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
      console.warn('Unable to assign to', params.target, ':', e.message);
    }
  }

  if (params.removeField) {
    ret = _.omit(data, params.removeField);
  }
  return ret || data;
}

module.exports = mutate;
