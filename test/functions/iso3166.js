/**
 * Test the iso3166 function.
 */

const should = require('chai').should();
var uut = require('../../lib/functions/iso3166');

describe('iso3166 function', () => {
  describe('convert two character ISO 3166', () => {
    it('Italy', () => {
      uut('IT')
      .should.eql('Italy');
    });

    it('Isle of Man', () => {
      uut('im')
      .should.eql('Isle of Man');
    });
  });

  describe('convert three character ISO 3166', () => {
    it('United States', () => {
      uut('USA')
      .should.eql('United States');
    });
  });

  describe('invalid codes', () => {
    it('no parameter', () => {
     should.not.exist(uut());
    });

    it('non-existent code', () => {
     should.not.exist(uut('uk'));
    });
  });
});
