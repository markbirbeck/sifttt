var _ = require('lodash');
var jsonPath = require('JSONPath');

var checkForSimpleAssignment = require('./../checkForSimpleAssignment');

function json(params, data) {
  var ret;

  try {
    var condition = checkForSimpleAssignment(data, params.if);

    if (!params.if || condition) {
      ret = _.clone(data);

      ret[params.target] = JSON.parse(jsonPath.eval(ret, params.source));
    }
  } catch (e) {
    throw(new Error('Unable to parse JSON from \'' + params.source + '\': ' +
      e));
  }

  return ret || data;
}

module.exports = json;
