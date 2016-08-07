'use strict';

const h = require('highland');
const gulp = require('gulp');

const ReadCollection = require('./ReadCollection');

class GulpCollection extends ReadCollection {
  constructor(source) {
    super();
    this._input = h(gulp.src(source));
  }
};

module.exports = GulpCollection;
