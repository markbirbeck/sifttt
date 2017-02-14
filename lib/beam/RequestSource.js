'use strict';

const request = require('../functions/request');

class RequestSource {
  constructor(opts) {
    this._opts = Object.assign({}, opts);
  }

  uri(uri) {
    this._opts.uri = uri;

    return this;
  }

  method(method) {
    this._opts.method = method;

    return this;
  }

  qs(qs) {
    this._opts.qs = qs;

    return this;
  }

  json(json) {
    this._opts.json = json;

    return this;
  }

  body(body) {
    this._opts.body = body;

    return this;
  }

  getStream() {
    return request(this._opts);
  }
}

module.exports = RequestSource;
