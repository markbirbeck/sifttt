'use strict';

const h = require('highland');

module.exports = class CompositeTransform {
  constructor() {
    this.pipeline = h();
  }

  apply2() {
    return h.pipeline(s => {
      return s.through(this.pipeline);
    });
  }

  /**
   * Just keep adding transforms to the pipeline:
   */

  apply(transform) {
    let fieldName = 'budgie';

    this.pipeline = this.pipeline
    .doto(element => {
      element[fieldName] = element[fieldName] || 0;
      element[fieldName]++;
    })
    ;

    // this.pipeline = this.pipeline
    // .through(transform);

    return this;
  }
}
