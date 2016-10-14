'use strict';

const sink = require('../sinks/echo');

class EchoSink {
  constructor(opts) {
    this._opts = opts || {};
  }

  getStream() {
    return sink.dest({}, this._opts);
  }
}

module.exports = EchoSink