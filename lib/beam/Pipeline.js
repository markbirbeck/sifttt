'use strict';

const h = require('highland');
const DirectPipelineRunner = require('./DirectPipelineRunner');

class Pipeline {
  constructor(options) {
    options = options || {};
    this._runner = new DirectPipelineRunner(options);
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
    this._runner.run(this, finished);
  }
};

exports.create = (options) => {
  return new Pipeline(options);
}
