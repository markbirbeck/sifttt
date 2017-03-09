'use strict';

const sink = require('../sinks/stdout');

class EchoSink {
  constructor(opts) {
    this._opts = opts || {};
  }

  getStream() {
    return sink.dest({}, this._opts);
  }
}

module.exports = EchoSink
