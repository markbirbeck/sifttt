'use strict';

class GulpSink {
  constructor(opts) {
    this._opts = opts || {};
  }

  getStream() {
    if (!this._opts.sink) {
      throw new Error('To use GulpSink set opts.sink to the Gulp instance');
    }
    return this._opts.sink.dest({}, this._opts);
  }
}

module.exports = GulpSink
