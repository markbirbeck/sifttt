'use strict';

const gulp = require('gulp');
const h = require('highland');

class GulpSource {
  constructor(source, options) {
    this._source = source;
    this._options = options;
  }

  getStream() {
    let src = gulp.src(this._source, this._options);

    /**
     * NOTE: Gulp's default for 'buffer' is 'true' so don't optimise
     *       this to !this._options.buffer:
     */

    if (this._options && this._options.buffer === false) {
      return src
      .pipe(h())
      .flatMap(f => h(f.contents));
    } else {
      return src;
    }
  }
}

module.exports = GulpSource;
