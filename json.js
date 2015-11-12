var _ = require('lodash');
var jsonPath = require('JSONPath');

function json(params, data) {
  var ret;

  try {
    ret = _.clone(data);

    ret[params.target] = JSON.parse(jsonPath.eval(ret, params.source));
  } catch (e) {
    throw(new Error('Unable to parse JSON from \'' + params.source + '\': ' +
      e));
  }

  return ret || data;
}

module.exports = json;
