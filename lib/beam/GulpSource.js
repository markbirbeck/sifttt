'use strict';

const gulp = require('gulp');

class GulpSource {
  constructor(source) {
    this._source = source;
  }

  getStream() {
    return gulp.src(this._source);
  }
}

module.exports = GulpSource;
