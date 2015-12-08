var jsonPath = require('JSONPath');

module.exports = (params, data) => {
  try {
    data[params.target] = JSON.parse(jsonPath.eval(data, params.source));
  } catch (e) {
    throw(new Error('Unable to parse JSON from \'' + params.source + '\': ' +
      e));
  }

  return data;
}
