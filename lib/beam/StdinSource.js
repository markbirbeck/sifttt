'use strict';

const h = require('highland');

class Source {
  constructor(options) {
    this._options = options;
  }

  getStream() {
    let src = process.stdin;

    return src
    .pipe(h())
    .split()
    .filter(row => row !== '')
    ;
  }
}

module.exports = Source;
