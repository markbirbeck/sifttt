'use strict';

const h = require('highland');

class Bounded {
  constructor(output) {
    this._output = output;
  }

  apply() {
    return h.through(h(this._output.getStream()));
  }
};

exports.to = (output) => {
  return new Bounded(output);
}
