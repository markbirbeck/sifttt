'use strict';
require('chai').should();

const h = require('highland');
const uut = require('../../lib/generators/date');
const moment = require('moment');

describe('date generator', () => {
  describe('range', () => {
    describe('ascending', () => {
      it('no start (defaults to today)', () => {

        /**
         * count up from today to a date in a week's time:
         */

        let oneWeeksTime = moment().add({weeks: 1}).format('YYYY-MM-DD');
        let result = [0, 1, 2, 3, 4, 5, 6].map(offset => {
          return moment().add({days: offset}).format('YYYY-MM-DD');
        });

        h(uut(oneWeeksTime))
        .toArray(ar => {
          ar.should.eql(result);
        })
        ;
      });

      it('no step (defaults to 1 day)', () => {

        /**
         * count up from January 29th to February 2nd:
         */

        h(uut('2016-01-29', '2016-02-02'))
        .toArray(ar => {
          ar.should.eql([
            '2016-01-29',
            '2016-01-30',
            '2016-01-31',
            '2016-02-01'
          ]);
        })
        ;
      });

      it('step', () => {

        /**
         * count up from January 29th to February 21st in weeks:
         */

        h(uut('2016-01-29', '2016-02-21', 7))
        .toArray(ar => {
          ar.should.eql([
            '2016-01-29',
            '2016-02-05',
            '2016-02-12',
            '2016-02-19'
          ]);
        })
        ;
      });

      it('unit and format', () => {

        /**
         * count up from 10pm on January 29th to 1am on January 30th, in hours:
         */

        h(uut('2016-01-29T22:00', '2016-01-30T01:00', 1, 'hours', 'YYYY-MM-DDTHH:mm'))
        .toArray(ar => {
          ar.should.eql([
            '2016-01-29T22:00',
            '2016-01-29T23:00',
            '2016-01-30T00:00'
          ]);
        })
        ;
      });
    });

    describe('descending', () => {
      it('no start (defaults to today)', () => {

        /**
         * count down from today to a date a week ago:
         */

        let oneWeekAgo = moment().subtract({weeks: 1}).format('YYYY-MM-DD');
        let result = [0, 1, 2, 3, 4, 5, 6].map(offset => {
          return moment().subtract({days: offset}).format('YYYY-MM-DD');
        });

        h(uut(oneWeekAgo))
        .toArray(ar => {
          ar.should.eql(result);
        })
        ;
      });

      it('no step (defaults to -1 day)', () => {

        /**
         * count down from December 3rd to November 28th, 2015:
         */

        h(uut('2015-12-03', '2015-11-28'))
        .toArray(ar => {
          ar.should.eql([
            '2015-12-03',
            '2015-12-02',
            '2015-12-01',
            '2015-11-30',
            '2015-11-29'
          ]);
        })
        ;
      });

      it('step', () => {

        /**
         * count down from December 10th to November 20th in weeks:
         */

        h(uut('2015-12-10', '2015-11-20', 7))
        .toArray(ar => {
          ar.should.eql([
            '2015-12-10',
            '2015-12-03',
            '2015-11-26'
          ]);
        })
        ;
      });
    });
  });

  it('use one generator to feed another', () => {

    /**
     * Count down from January 5th to 2nd ...
     */

    h(uut('2016-01-05', '2016-01-02'))

    /**
     * ... and for each value count from it, to the end of January,
     * in weeks:
     */

    .flatMap(start => h(uut(start, '2016-01-31', 7)))
    .toArray(ar => {
      ar.should.eql([
        '2016-01-05', '2016-01-12', '2016-01-19', '2016-01-26',
        '2016-01-04', '2016-01-11', '2016-01-18', '2016-01-25',
        '2016-01-03', '2016-01-10', '2016-01-17', '2016-01-24'
      ]);
    })
    ;
  });
});
