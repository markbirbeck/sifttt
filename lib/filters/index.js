'use strict';
let _ = require('lodash');

let filters = {
  geoip: require('./geoip'),
  json: require('./json'),
  mutate: require('./mutate')
};

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
