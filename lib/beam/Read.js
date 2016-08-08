'use strict';

const h = require('highland');

class Read {
  apply() {
    return h.through(h(this._input.getStream()));
  }

  from(input) {
    this._input = input;

    return this;
  }
};

module.exports = new Read();
