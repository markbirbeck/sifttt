'use strict';

const h = require('highland');

class DirectPipelineRunner {
  constructor(options) {
    this._options = options || {};
  }

  run(pipeline, finished) {

    /**
     * The transforms list is a set of curried functions; use them to
     * create a Highland pipeline:
     */

    let p = h.pipeline.apply(null, pipeline._transforms);

    h()
    .through(p)
    .errors(err => {
      console.warn(`Error in pipeline '${this._options.name}': ${err.stack}`);

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

module.exports = DirectPipelineRunner;
