'use strict';
let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

let uut = require('../../lib/filters/weather');

describe('weather', () => {
  it('in London on January 1st, 2008', function() {
    let res = uut(
      {
        source: {
          latitude: 51.506,
          longitude: -0.127,
          time: '2008-01-01T00:00:01Z'
        },
        target: 'weather'
      },
      {}
    );

    return res.should.eventually.have
    .property('weather')
    .include({
      summary: 'Mostly cloudy throughout the day.',
      precipType: 'rain'
    })
    ;
  });
});
