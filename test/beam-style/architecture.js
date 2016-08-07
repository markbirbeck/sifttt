/**
 * These tests help to experiment with the architecture for
 * building pipelines from components.
 */

'use strict';
require('chai').should();

const h = require('highland');

/**
 * The top-level component is a Pipeline, which runs against transforms
 * by using its apply() method.
 *
 *  let p = new Pipeline()
 *  .apply(new InputCollection([1, 2, 3, 4]))
 *  .apply(Doto(element => {
 *    console.log(`Got an element: ${JSON.stringify(element)}`);
 *  }))
 *  ;
 *
 *  p.run();
 *
 * This would mean that everything has to have an apply() method, since it
 * will be invoked in a standard way from the framework.
 *
 * The advantage of this approach is that it's quite easy to make
 * extensions to the library, by implementing a bunch of classes
 * that have an apply() method. It also means that the extensions
 * could be applied to any library not just Highland.
 */

class Pipeline {
  constructor() {
    this._input = h();
  }

  apply(obj) {

    /**
     * If this is the first time through, initialise the pipeline:
     */

    this._pipeline = this._pipeline || this._input;

    /**
     * If we have a curried function then call it with the current
     * pipeline as input:
     */

    if (typeof obj === 'function') {
      this._pipeline = obj(this._pipeline);
    }

    /**
     * Otherwise, we lot the object itself do to the pipeline, whatever
     * it does:
     */

    else {
      this._pipeline = obj.apply(this._pipeline);
    }
    return this;
  }

  run(cb) {
    this._pipeline = h.done(cb, this._pipeline);
  }
};

describe('Pipeline', () => {
  describe('input from', () => {
    it('Highland', (done) => {
      let p = new Pipeline()
      .apply(h.through(h([4, 3, 2, 1])))
      .apply(h.map(element => element * 7))
      .apply(h.collect())
      .apply(h.doto(ar => {
        ar.should.eql([
          4 * 7,
          3 * 7,
          2 * 7,
          1 * 7
        ]);
      }))
      ;

      p.run(done);
    });

    it('InputCollection', (done) => {
      let p = new Pipeline()
      .apply(new InputCollection([4, 3, 2, 1]))
      .apply(h.map(element => element - 8))
      .apply(h.collect())
      .apply(h.doto(ar => {
        ar.should.eql([
          4 - 8,
          3 - 8,
          2 - 8,
          1 - 8
        ]);
      }))
      ;

      p.run(done);
    });
  });
});


/**
 * In Beam parlance the data source is an input collection, which is
 * a special kind of transform for a Pipeline:
 *
 *  new Pipeline()
 *  .apply(new InputCollection([1, 2, 3, 4]))
 *  .apply(Doto(element => {
 *    console.log(`Got an element: ${JSON.stringify(element)}`);
 *  }))
 *  ;
 */

class InputCollection {
  constructor(source) {
    this._input = h(source);
  }

  /**
   * [TODO] This doesn't feel right because it's not consistent with
   *        Pipeline.apply(), which is returning 'this'.
   */

  apply(pipeline) {
    return h.through(this._input, pipeline);
  }
};
