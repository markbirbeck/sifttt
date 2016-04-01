var path = require('path');
require('chai').should();
var supertest = require('supertest');
var uut = require('../../lib/api');

var recipe = {
  name: 'file',
  input: {
    channel: 'gulp',
    glob: path.join(__dirname, '..', 'fixtures', 'file.json')
  },
  output: {
    channel: 'gulp',
    glob: path.join(__dirname, '..', 'fixtures', 'output')
  }
};
var connections = {};
var channels = require('../../lib/channels')(connections, [recipe]);

var api = uut([recipe], connections, channels);
var request = supertest(api().app);

describe('api', function() {
  it('return file using recipe', function(done) {
    request
    .get('/file')
    .expect(200, {hello: 'world'}, done)
    ;
  });

  it('return different file by overriding parameter', function(done) {
    request
    .get(`/file?override=input.glob=${path.join(__dirname, '..', 'fixtures', 'file2.json')}`)
    .expect(200, {hello: 'there'}, done)
    ;
  });

  describe('cors', function() {
    it('does not return a CORS header by default', function(done) {
      request
      .get('/file')
      .set('Origin', 'localhost')
      .expect(res => {

        /**
         * Be careful here...when using SuperTest's expect() method then the
         * header can be 'Access-Control-Allow-Origin', but when testing a
         * property directly, we have to be sure to use the same case as
         * SuperTest:
         */

        res.headers
        .should.not.have.property('access-control-allow-origin');
      })
      .end(done)
      ;
    });

    // TODO: Work out how best to test these cases which rely on environment variables.

    xit('returns a wildcard CORS header', function(done) {
      // Set CORS_ENABLED

      request
      .get('/file')
      .set('Origin', 'localhost')
      .expect('Access-Control-Allow-Origin', '*')
      .end(done)
      ;
    });

    xit('returns an origin-mirroring CORS header', function(done) {
      // Set CORS_ORIGIN

      request
      .get('/file')
      .set('Origin', 'localhost')
      .expect('Access-Control-Allow-Origin', 'localhost')
      .end(done)
      ;
    });

    xit('returns a credentials CORS header', function(done) {
      // Set CORS_CREDENTIALS

      request
      .get('/file')
      .set('Origin', 'localhost')
      .expect('Access-Control-Allow-Credentials', 'true')
      .end(done)
      ;
    });
  });
});
