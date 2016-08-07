'use strict';

const h = require('highland');

class ReadCollection {
  apply() {
    return h.through(this._input);
  }
};

module.exports = ReadCollection;
