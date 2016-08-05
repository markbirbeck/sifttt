'use strict';

const h = require('highland');

module.exports = class Pipeline {
  constructor(params) {
    this.params = [params || {}];
    this.pipeline = h();
  }

  /**
   * Just keep adding transforms to the pipeline:
   */

  apply(transform) {
    console.log('Pipeline.apply');
    if (transform.apply2) {
      console.log('About to call apply2');
      this.pipeline = this.pipeline
      .through(transform.apply2());
    } else {
      console.error('Pipeline: Transform does not have an apply2() method');
    }
    return this;
  }

  /**
   * Run the pipeline:
   */

  run(finish) {
    return h(this.params)
    .doto(params => {
      console.log('About to run command in Class Pipeline:', params);
    })
    .through(this.pipeline)
    .done(() => {
      console.log('All Done');
      if (finish) {
        finish();
      }
    })
    ;
  }
}
