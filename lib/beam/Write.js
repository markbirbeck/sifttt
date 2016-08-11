'use strict';

const h = require('highland');

class Bounded {
  constructor(sink) {
    this._sink = sink;
  }

  apply() {
    return h.through(h(this._sink.getStream()));
  }
};

exports.to = (sink) => {
  return new Bounded(sink);
}
