'use strict';

const h = require('highland');

class Write {
  apply() {
    return h.through(h(this._output.getStream()));
  }

  to(output) {
    this._output = output;

    return this;
  }
};

module.exports = new Write();
