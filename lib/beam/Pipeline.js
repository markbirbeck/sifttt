'use strict';

const h = require('highland');

class Pipeline {
  constructor() {
    this._input = h();
    this._transforms = [];
  }

  apply(obj) {

    /**
     * If we have a curried function then save it as is:
     */

    if (typeof obj === 'function') {
      this._transforms.push(obj);
    }

    /**
     * Otherwise, we let the object itself tell us what to
     * save:
     */

    else {
      this._transforms.push(obj.apply());
    }

    return this;
  }

  run(cb) {
    /**
     * The transforms list is a set of curried functions; use them to
     * a Highland pipeline:
     */

    let pipeline = s => this._transforms.reduce((stream, fn) => fn(stream), s);

    h()
    .through(pipeline)
    .done(cb);
  }
};

module.exports = Pipeline;
