'use strict';
const iso3166 = require('iso-3166-2');

module.exports = val => {
  try {
    let country = iso3166.country(val);

    return (country) ? country.name : undefined;
  } catch(e) {
    if (e.message === 'Cannot read property \'trim\' of undefined') {
      return undefined;
    }
    console.log(e.message);
    throw(new Error(`Unable to convert '${val}' in ISO 3166`));
  }
};
