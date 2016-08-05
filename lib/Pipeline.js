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

  run() {
    return h(this.params)
    .doto(params => {
      console.log('About to run command in Pipeline:', params);
    })
    .through(this.pipeline)
    .done(() => {
      console.log('All Done');
    })
    ;
  }
};
