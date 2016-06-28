/**
 * Test the moment function.
 */

require('chai').should();
var uut = require('../../lib/functions/moment');

describe('moment function', () => {
  it('no parameters gives current date and time', () => {
   uut()
   .should.eql(new Date().toISOString().replace(/\.\d{3}/, ''));
  });

  it('set specific date and time', () => {
   uut('2016-05-04T03:01:20Z')
   .should.eql('2016-05-04T03:01:20Z');
  });

  it('format the output', () => {
   uut('2013-02-04T03:01:20Z', 'YYYY')
   .should.eql('2013');
  });

  it('use an offset', () => {
   uut('2014-05-04T03:01:20Z', 'YYYY-MM-DD', '-P1M')
   .should.eql('2014-04-04');
  });
});
