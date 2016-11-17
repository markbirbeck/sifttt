/**
 * Test the convert function.
 */

require('chai').should();
var uut = require('../../lib/functions/convert');

describe('converter functions', () => {
  describe('toArray()', () => {
    it('non-array', () => {
      uut.toArray('hello, there!')
      .should.eql(['hello, there!']);
    });

    it('should not nest existing array', () => {
      uut.toArray(['hello', 'there!'])
      .should.eql(['hello', 'there!']);
    });
  });

  describe('toDate()', () => {
    describe('from number', () => {
      it('seconds', () => {
        uut.toDate(1446807983)
        .should.equal('2015-11-06T11:06:23.000Z');
      });

      it('milliseconds', () => {
        uut.toDate(1446807984789)
        .should.equal('2015-11-06T11:06:24.789Z');
      });
    });

    describe('from string', () => {
      it('seconds', () => {
        uut.toDate('1446807985')
        .should.equal('2015-11-06T11:06:25.000Z');
      });

      it('milliseconds', () => {
        uut.toDate('1446807986789')
        .should.equal('2015-11-06T11:06:26.789Z');
      });

      it('date', () => {
        uut.toDate('2015-11-07')
        .should.equal('2015-11-07T00:00:00.000Z');
      });
    });
  });

  describe('toNumber()', () => {
    it('from number', () => {
      uut.toNumber(500.778)
      .should.equal(500.778);
    });

    it('from string', () => {
      uut.toNumber('7760.78')
      .should.equal(7760.78);
    });

    it('not a number', () => {
      uut.toNumber('345xyz')
      .should.equal('345xyz');
    });
  });

  describe('toString()', () => {
    it('from number', () => {
      uut.toString(500.778)
      .should.equal('500.778');
    });

    it('from string', () => {
      uut.toString('enough already')
      .should.equal('enough already');
    });
  });

  describe('convert()', () => {

    it('array', () => {
      uut.convert(7, 'array')
      .should.eql([7]);
    });

    it('date', () => {
      uut.convert(1446807989, 'date')
      .should.equal('2015-11-06T11:06:29.000Z');
    });

    it('number', () => {
      uut.convert('50220.8', 'number')
      .should.equal(50220.8);
    });

    it('string', () => {
      uut.convert(5020.668, 'string')
      .should.equal('5020.668');
    });

    describe('type parameter errors', () => {
      it('no type provided', function() {
        (function() {
          uut.convert(50.8)
        }).should.throw('No type conversion provided');
      });

      it('invalid type', function() {
        (function() {
          uut.convert(5020.668, 'invalid')
        }).should.throw(`No type conversion for 'invalid'`);
      });
    });
  });
});
