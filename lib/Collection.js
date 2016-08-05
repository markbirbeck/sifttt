'use strict';

const h = require('highland');

module.exports = class Collection {
  constructor(source) {
    this.source = source;
  }

  apply2() {
    console.log('Collection.apply2');
    return h(this.source);
  }
};
