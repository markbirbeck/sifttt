var path = require('path');
require('chai').should();
var uut = require('../lib/geoip');

describe('geoip', function() {
  it('IP should be in New York', function() {
    var res = uut(
      {
        source: 'clientip',
        target: 'geoip',
        database: path.join(__dirname, '../GeoIP/GeoLiteCity.dat')
      },
      {clientip: '66.6.44.4'}
    );

    res
    .should.have.property('geoip');

    res.geoip
    .should.have.property('city', 'New York');
  });

  describe('should error if', function() {
    it('no database parameter', function() {
      (function() {
        uut(
          {
            source: 'clientip',
            target: 'geoip'
          },
          {clientip: '66.6.44.4'}
        )
      })
      .should.throw('Unable to get geoip for \'clientip\': Error: Please ' +
        'provide a value for the \'database\' parameter');
    });

    it('no database found at path', function() {
      (function() {
        uut(
          {
            source: 'clientip',
            target: 'geoip',
            database: 'noSuchDatabase.dat'
          },
          {clientip: '66.6.44.4'}
        )
      })
      .should.throw('Unable to get geoip for \'clientip\': Error: ENOENT: no ' +
        'such file or directory, stat \'noSuchDatabase.dat\'');
    });
  });
});
