'use strict';

const h = require('highland');

class Pipeline {
  constructor(name) {
    this._name = name;
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

  run(finished) {

    /**
     * The transforms list is a set of curried functions; use them to
     * a Highland pipeline:
     */

    let pipeline = h.pipeline.apply(null, this._transforms);

    h()
    .through(pipeline)
    .errors(err => {
      console.warn(`Error in pipeline '${this._name}': ${err.message}`);

      /**
       * [TODO] Make exiting the process configurable.
       *
       * process.exit(1);
       */

    })
    .done(() => {
      if (finished) {
        finished();
      }
    })
    ;
  }
};

module.exports = Pipeline;
