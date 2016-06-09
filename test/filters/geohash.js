'use strict';
require('chai').should();
let uut = require('../../lib/filters/geohash');

describe.only('geohash', () => {
  describe('decode', () => {
    it('precision 3', () => {
      uut(
        {
          source: '#{a}',
          target: 'b'
        },
        {a: 'bbc'}
      )
      .should.eql({
        a: 'bbc',
        b: {
          'latitude': 49.92187500,
          'longitude': -144.14062500
        }
      });
    });

    it('precision 9', () => {
      uut(
        {
          source: '#{a}',
          target: 'b'
        },
        {a: 'ww8p1r4t8'}
      )
      .should.eql({
        a: 'ww8p1r4t8',
        b: {
          'latitude': 37.83238649368286,
          'longitude': 112.55838632583618
        }
      });
    });
  });
});
