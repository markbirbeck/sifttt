'use strict';

const ga = require('../sinks/googleAnalytics');

class GoogleAnalyticsSink {
  constructor() {
    this._opts = {};
  }

  trackingId(trackingId) {
    this._opts.trackingId = trackingId;

    return this;
  }

  getStream() {
    return ga.dest({}, this._opts);
  }
}

module.exports = GoogleAnalyticsSink;
