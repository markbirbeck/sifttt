'use strict';

const h = require('highland');

class Bounded {
  constructor(input) {
    this._input = input;
  }

  apply() {
    return h.through(h(this._input.getStream()));
  }
};

exports.from = (input) => {
  return new Bounded(input);
}
