'use strict';
const NodeGeocoder = require('node-geocoder');
let geocoder = NodeGeocoder({provider: 'google'});

module.exports = (address) => {
  return geocoder.geocode(address)
  .then(result => {
    if (result && result[0]) {
      return Promise.resolve(result[0]);
    } else {
      return Promise.resolve('Unable to geocode');
    }
  })
  .catch(e => {
    throw(new Error(`Unable to geocode address '${address}': ${e}`));
  })
  ;
}
