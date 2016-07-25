'use strict';
const NodeGeocoder = require('node-geocoder');
let geocoder = NodeGeocoder({provider: 'google'});

module.exports = (address) => {
  return geocoder.geocode(address)
  .then(result => {
    if (result && result[0]) {
      return Promise.resolve(result[0]);
    } else {
      return Promise.resolve({
        error: `Failed to geocode: ${JSON.stringify(address)}`
      });
    }
  })
  .catch(e => {
    return Promise.resolve({
      error: `Failed to geocode: ${JSON.stringify(address)} [${e}]`
    });
  })
  ;
}
