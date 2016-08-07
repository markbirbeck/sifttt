'use strict';

const h = require('highland');
const gulp = require('gulp');

class GulpCollection {
  constructor(source) {
    this._input = h(gulp.src(source));
  }

  apply() {
    return h.through(this._input);
  }
};

module.exports = GulpCollection;
