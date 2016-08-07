'use strict';

const h = require('highland');

class WriteCollection {
  apply() {
    return h.through(h(this._output));
  }
};

module.exports = WriteCollection;
