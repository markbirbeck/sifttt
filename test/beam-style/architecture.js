/**
 * These tests help to experiment with the architecture for
 * building pipelines from components.
 */

'use strict';
require('chai').should();

const h = require('highland');

/**
 * In Beam parlance the data source is an input collection, to which things
 * are applied:
 *
 *  new InputCollection([1, 2, 3, 4])
 *  .apply(Doto(element => {
 *    console.log(`Got an element: ${JSON.stringify(element)}`);
 *  }))
 *  ;
 *
 * This would mean that everything has to have an apply() method, since it
 * will be invoked in a standard way from the framework.
 *
 * The advantage of this approach is that it's quite easy to make
 * extensions to the library, by implementing a bunch of classes
 * that have an apply() method. It also means that the extensions
 * could be applied to any library not just Highland.
 */

class InputCollection {
  constructor(source) {
    this._input = source;
  }

  apply(fn) {

    /**
     * If this is the first time through, initialise the pipeline:
     */

    this._pipeline = this._pipeline || this._input;

    /**
     * Now just call the curried function with the current pipeline
     * as input:
     */

    this._pipeline = fn(this._pipeline);
    return this;
  }
};

describe('InputCollection', () => {
  it('simple input', (done) => {
    new InputCollection([1, 2, 3, 4])
    .apply(h.map(element => element * 2))
    .apply(h.collect())
    .apply(h.doto(ar => {
      ar.should.eql([
        1 * 2,
        2 * 2,
        3 * 2,
        4 * 2
      ]);
    }))
    .apply(h.done(done))
    ;
  });
});
