'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

const uut = require('../../lib/filters/geocode');

describe('geocode', () => {
  it('address in Paris', () => {
    let res = uut(
      {
        source: {
          provider: 'google',
          apiKey: process.env.GOOGLE_API_SERVER_KEY,
          address: '#{a}'
        },
        target: 'b'
      },
      {a: '29 champs elysée paris'}
    );

    return Promise.all([
      res.should.eventually.have
      .property('a', '29 champs elysée paris'),

      res.should.eventually.have
      .property('b')
      .include({
        'latitude': 48.869384,
        'longitude': 2.3071868
      })
    ]);
  });

  it('unable to geocode', () => {
    let res = uut(
      {
        source: {
          provider: 'google',
          apiKey: process.env.GOOGLE_API_SERVER_KEY,
          address: '#{a}'
        },
        target: 'b'
      },
      {a: 'gibberish'}
    );

    return Promise.all([
      res.should.eventually.deep
      .equal({
        a: 'gibberish',
        b: {
          error: 'Failed to geocode: \"gibberish\"'
        }
      })
    ]);
  });
});
