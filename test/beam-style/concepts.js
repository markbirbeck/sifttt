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
