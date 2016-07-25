'use strict';
const NodeGeocoder = require('node-geocoder');
const coverup = require('coverup');
let geocoders = {};

module.exports = (address, providerId, apiKey) => {
  let provider;
  let geocoder;

  /**
   * Check our cache to see if we already have a geocoder for this
   * provider/key combination:
   */

  if (!geocoders[providerId]) {
    console.log(`No geocoder for provider ID: '${providerId}'`);
    geocoders[providerId] = {};
  }
  provider = geocoders[providerId];

  if (!provider[apiKey]) {
    console.log(`No geocoder for API key: '${coverup(apiKey, {keepLeft: 4, keepRight: 4})}'`);
    provider[apiKey] = NodeGeocoder({
      provider: providerId,
      apiKey: apiKey
    });
  }
  geocoder = provider[apiKey];

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
