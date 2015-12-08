var path = require('path');
require('chai').should();
var uut = require('../../lib/filters/geoip');

describe('geoip', function() {
  describe('IP should be in New York', function() {
    it('direct', function() {
      var res = uut(
        {
          source: '66.6.44.4',
          target: 'geoip',
          database: path.join(__dirname, '../../GeoIP/GeoLiteCity.dat')
        }
      );

      res
      .should.have.property('geoip');

      res.geoip
      .should.have.property('city', 'New York');
    });

    it('indirect', function() {
      var res = uut(
        {
          source: '#{clientip}',
          target: 'geoip',
          database: path.join(__dirname, '../../GeoIP/GeoLiteCity.dat')
        },
        {clientip: '66.6.44.4'}
      );

      res
      .should.have.property('geoip');

      res.geoip
      .should.have.property('city', 'New York');
    });
  });

  describe('should error if', function() {
    it('no database parameter', function() {
      (function() {
        uut(
          {
            source: '66.6.44.4',
            target: 'geoip'
          }
        )
      })
      .should.throw('Unable to get geoip for \'66.6.44.4\': Error: Please ' +
        'provide a value for the \'database\' parameter');
    });

    it('no database found at path', function() {
      (function() {
        uut(
          {
            source: '66.6.44.4',
            target: 'geoip',
            database: 'noSuchDatabase.dat'
          }
        )
      })
      .should.throw('Unable to get geoip for \'66.6.44.4\': Error: ENOENT: no ' +
        'such file or directory, stat \'noSuchDatabase.dat\'');
    });
  });
});
