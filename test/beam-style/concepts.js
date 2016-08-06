/**
 * These tests help to experiment with high-level concepts such as
 * nesting pipelines, chaining pipelines, and so on.
 */

'use strict';
require('chai').should();

const h = require('highland');

/**
 * The first thing we want to do is take in a stream of numbers
 * and operate on them:
 */

describe('basic pipeline', () => {
  it('simple input', () => {

    /**
     * Double some elements:
     */

    h([1, 2, 3, 4])
    .map(element => {
      return element * 2;
    })
    .toArray(ar => {
      ar.should.eql([2, 4, 6, 8]);
    })
    ;
  });
});

describe('nested pipeline', () => {
  it('using through() with stream as parameter', () => {

    /**
     * Create a pipeline that doubles the elements and adds 3:
     */

    let p = s => s
    .map(element => {
      return element * 2;
    })
    .map(element => {
      return element + 3;
    })
    ;

    /**
     * Triple some elements, run them through the pipeline, and then
     * subtract 2:
     */

    h([1, 2, 3, 4])
    .map(element => {
      return element * 3;
    })
    .through(p)
    .map(element => {
      return element - 2;
    })
    .toArray(ar => {
      ar.should.eql([
        (((1 * 3) * 2) + 3) - 2,
        (((2 * 3) * 2) + 3) - 2,
        (((3 * 3) * 2) + 3) - 2,
        (((4 * 3) * 2) + 3) - 2
      ]);
    })
    ;
  });
});
