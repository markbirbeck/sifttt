'use strict';

const h = require('highland');

module.exports = class Pipeline {
  constructor(params) {
    this.params = [params || {}];
    this.pipeline = h();
  }

  apply(transform) {
    this.pipeline = this.pipeline
    .through(transform)
    ;

    return this;
  }

  apply2() {
    return h.pipeline(s => {
      return s.through(this.pipeline);
    });
  }

  run() {
    return h(this.params)
    .doto(params => {
      console.log('About to run command in Pipeline:', params);
    })
    // .through(this.pipeline)
    .through(this.apply2())
    .done(() => {
      console.log('All Done');
    })
    ;
  }
};
