'use strict';
let objectPath = require('object-path');

module.exports = (params, data) => {
  try {
    if (!params.field) {
      throw(new Error('A field name is required for urldecode'));
    }

    let val = objectPath.get(data, params.field);

    if (val) {
      objectPath.set(data, params.field, decodeURI(val));
    }
    return data;
  } catch (e) {
    throw(new Error(`Unable to decode URI: ${e}`));
  }
}
