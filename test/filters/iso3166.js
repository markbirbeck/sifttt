'use strict';
require('chai').should();
var uut = require('../../lib/filters/iso3166');

describe('iso3166 filter', function() {
  it('convert two character ISO 3166', () => {
    let res = uut(
      {
        source: 'im',
        target: 'country'
      },
      {}
    );

    res.should.have.property('country', 'Isle of Man');
  });

  it('convert three character ISO 3166', () => {
    let res = uut(
      {
        source: 'usa',
        target: 'nation'
      },
      {}
    );

    res.should.have.property('nation', 'United States');
  });

  it('record error when invalid code', () => {
    let res = uut(
      {
        source: 'uk',
        target: 'nation',
        error: '_error.nation'
      },
      {}
    );

    res.should.have.deep.property(
      '_error.nation',
      'Unable to convert country: \'uk\' is not a valid ISO 3166 value.'
    );
  });
});
