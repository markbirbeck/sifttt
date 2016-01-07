'use strict';
let _ = require('lodash');

let filters = {
  geoip: fnCaller(require('./geoip')),
  javascript: fnCaller(require('./javascript')),
  json: fnCaller(require('./json')),
  mutate: fnCaller(require('./mutate')),
  sum: fnCaller(require('./sum'))
};
let checkForSimpleAssignment = require('./../checkForSimpleAssignment');

function fnCaller(fn) {
  return (params, data) => {
    try {
      var condition = checkForSimpleAssignment(data, params.if);

      if (!params.if || condition) {
        return fn(params, data || {});
      } else {
        return data;
      }
    } catch (e) {
      throw(new Error('Unable to process filter: ' + e));
    }
  }
}

module.exports = function(wrapper) {
  return _.zipObject(
    Object.getOwnPropertyNames(filters)
    .map(filter => {
      return [
        filter,
        (wrapper)
          ? (params, data) => wrapper(params, data, filters[filter])
          : filters[filter]
      ];
    })
  );
}
