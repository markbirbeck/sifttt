'use strict';
require('chai').should();
var uut = require('../../lib/filters/moment');

describe('moment filter', function() {
  it('no parameters gives current date and time', () => {
    let res = uut(
      { target: 'moment' },
      {}
    );

    res
    .should.have.property(
      'moment',
      new Date().toISOString().replace(/\.\d{3}/, '')
    );
  });

  describe('use @source for date and time', () => {
    it('literal', () => {
      let res = uut(
        {
          source: '2015-04-01T03:01:20Z',
          format: 'YYYY DD',
          target: 'moment'
        },
        {}
      );

      res
      .should.have.property('moment', '2015 01');
    });

    it('indirect', () => {
      let res = uut(
        {
          source: '#{a}',
          format: 'Q w',
          target: 'moment'
        },
        {
          a: '2012-04-01T04:07:20Z'
        }
      );

      res
      .should.have.property('moment', '2 14');
    });

    it('formula', () => {
      let res = uut(
        {
          source: '#{a}T#{b}Z',
          format: 'd D DDD',
          target: 'moment'
        },
        {
          a: '2010-04-01',
          b: '22:09:20'
        }
      );

      res
      .should.have.property('moment', '4 1 91');
    });
  });

  it('use an offset and format', () => {
    let res = uut(
      {
        offset: '-P1Y',
        format: 'YYYY',
        target: 'moment'
      },
      {}
    );

    let lastYear = Number(new Date().toISOString().match(/\d{4}/)[0]) - 1;

    res
    .should.have.property('moment', String(lastYear));
  });
});
