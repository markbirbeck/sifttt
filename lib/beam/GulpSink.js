'use strict';

class GulpSink {
  constructor(opts) {
    this._opts = opts || {};
  }

  getStream() {
    return this._opts.sink.dest({}, this._opts);
  }
}

module.exports = GulpSink
