'use strict';
require('chai').should();
var uut = require('../../lib/filters/sum');

describe('sum', function() {
  describe('default property names', () => {
    it('a list of numbers', () => {
      let data = uut(
        { source: 'buckets' },
        { buckets: [ 1453, 1000, 15, 30 ] }
      );

      data.should.have.property('sumTotal', 2498);
      data.should.have.property('sumNums', 4);
      ;
    });

    it('a list of objects', () => {
      let data = uut(
        { source: 'buckets' },
        {
          buckets: [
            { id: 'webplayer', value: 1453 },
            { id: 'iPhone', value: 1000 },
            { id: 'iPod Touch', value: 15 },
            { id: 'iPad', value: 30 }
          ]
        }
      );

      data.should.have.property('sumTotal', 2498);
      data.should.have.property('sumNums', 4);
    });
  });

  describe('explicit target property names', () => {
    it('a list of numbers', () => {
      let data = uut(
        {
          source: 'buckets',
          target: 'total',
          count: 'count'
        },
        { buckets: [ 1453, 1000, 15, 30 ] }
      );

      data.should.have.property('total', 2498);
      data.should.have.property('count', 4);
    });

    it('a list of objects', () => {
      let data = uut(
        {
          source: 'buckets',
          target: 'total',
          count: 'count'
        },
        {
          buckets: [
            { id: 'webplayer', value: 1453 },
            { id: 'iPhone', value: 1000 },
            { id: 'iPod Touch', value: 15 },
            { id: 'iPad', value: 30 }
          ]
        }
      );

      data.should.have.property('total', 2498);
      data.should.have.property('count', 4);
    });
  });
});
