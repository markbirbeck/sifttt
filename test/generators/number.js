'use strict';
require('chai').should();

const h = require('highland');
const uut = require('../../lib/generators/number');

describe('number generator', () => {
  describe('range', () => {
    describe('ascending', () => {
      it('no start (defaults to 0)', () => {

        /**
         * count up from 0 to 3:
         */

        h(uut(3))
        .toArray(ar => {
          ar.should.eql([0, 1, 2]);
        })
        ;
      });

      it('no step (defaults to 1)', () => {

        /**
         * count up from 2 to 5:
         */

        h(uut(2, 5))
        .toArray(ar => {
          ar.should.eql([2, 3, 4]);
        })
        ;
      });

      it('step', () => {

        /**
         * Count up from 2 to 10 in 2s:
         */

        h(uut(2, 10, 2))
        .toArray(ar => {
          ar.should.eql([2, 4, 6, 8]);
        })
        ;
      });
    });

    describe('descending', () => {
      it('no start (defaults to 0)', () => {

        /**
         * count down from 0 to -3:
         */

        h(uut(-3))
        .toArray(ar => {
          ar.should.eql([0, -1, -2]);
        })
        ;
      });

      it('no step (defaults to -1)', () => {

        /**
         * count down from 5 to 2:
         */

        h(uut(5, 2))
        .toArray(ar => {
          ar.should.eql([5, 4, 3]);
        })
        ;
      });

      it('step', () => {

        /**
         * Count down from 10 to 2 in 2s (three ways to express the
         * same thing):
         */

        h(uut(10, 2, 2))
        .toArray(ar => {
          ar.should.eql([10, 8, 6, 4]);
        })
        ;

        h(uut(10, 2, -2))
        .toArray(ar => {
          ar.should.eql([10, 8, 6, 4]);
        })
        ;

        h(uut(2, 10, -2))
        .toArray(ar => {
          ar.should.eql([10, 8, 6, 4]);
        })
        ;
      });
    });
  });

  describe('handles strings', () => {

    /**
     * Count up from 2 to 10 in 2s:
     */

    h(uut('2', '10', '2'))
    .toArray(ar => {
      ar.should.eql([2, 4, 6, 8]);
    })
    ;
  });

  /**
   * Tests from https://lodash.com/docs#range:
   */

  it('lodash #range compatible', () => {
    h(uut(4))
    .toArray(ar => {
      ar.should.eql([0, 1, 2, 3]);
    })
    ;
    h(uut(-4))
    .toArray(ar => {
      ar.should.eql([0, -1, -2, -3]);
    })
    ;
    h(uut(1, 5))
    .toArray(ar => {
      ar.should.eql([1, 2, 3, 4]);
    })
    ;
    h(uut(0, 20, 5))
    .toArray(ar => {
      ar.should.eql([0, 5, 10, 15]);
    })
    ;
    h(uut(0, -4, -1))
    .toArray(ar => {
      ar.should.eql([0, -1, -2, -3]);
    })
    ;

    /**
     * We disagree with Lodash here...they have [1, 1, 1] but we
     * think a step of zero should be a NOP (otherwise not sure how
     * they get from 1 to 4 by repeatedly adding 0):
     */

    h(uut(1, 4, 0))
    .toArray(ar => {
      ar.should.eql([1]);
    })
    ;

    /**
     * We disagree with Lodash here, too...they have [] but we
     * think (0) is equivalent to (0, 0, 1) (because of the default
     * values) so should return 0:
     */

    h(uut(0))
    .toArray(ar => {
      ar.should.eql([0]);
    })
    ;
  });

  it('use one generator to feed another', () => {

    /**
     * Count down from 8 to 2 ...
     */

    h(uut(8, 2))

    /**
     * ... and for each value count to 6 (could be up or down, depending on
     * starting value):
     */

    .flatMap(start => h(uut(start, 6)))
    .toArray(ar => {
      ar.should.eql([
        8, 7,
        7,
        6,
        5,
        4, 5,
        3, 4, 5
      ]);
    })
    ;
  });
});
