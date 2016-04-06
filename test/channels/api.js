'use strict';
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
var codecs = {};
var channels = require('../../lib/channels')(connections, [recipe]);

let api;
let request;

describe('api', function() {
  afterEach(() => {
    api.server.close();
  });

  it('return file using recipe', function(done) {
    api = uut([recipe], connections, codecs, channels)();
    request = supertest(api.app);

    request
    .get('/file')
    .expect(200, {hello: 'world'}, done)
    ;
  });

  it('return different file by overriding parameter', function(done) {
    api = uut([recipe], connections, codecs, channels)();
    request = supertest(api.app);

    request
    .get(`/file?override=input.glob=${path.join(__dirname, '..', 'fixtures', 'file2.json')}`)
    .expect(200, {hello: 'there'}, done)
    ;
  });

  describe('cors', function() {
    let saveCors = {};

    before(() => {
      ['CORS_ENABLED', 'CORS_ORIGIN', 'CORS_CREDENTIALS']
      .forEach(param => {
        saveCors[param] = process.env[param];
        delete process.env[param];
      });
    });

    after(() => {
      Object.keys(saveCors)
      .forEach(param => {
        process.env[param] = saveCors[param];
      });
    });

    it('does not return a CORS header by default', function(done) {
      api = uut([recipe], connections, codecs, channels)();
      request = supertest(api.app);

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

    it('returns a wildcard CORS header', function(done) {
      process.env.CORS_ENABLED = true;
      process.env.CORS_ORIGIN = '*';
      api = uut([recipe], connections, codecs, channels)();
      request = supertest(api.app);

      request
      .get('/file')
      .set('Origin', 'localhost')
      .expect('Access-Control-Allow-Origin', '*')
      .end(done)
      ;
    });

    it('returns an origin-mirroring CORS header', function(done) {
      process.env.CORS_ENABLED = true;
      process.env.CORS_ORIGIN = 'http://localhost';
      api = uut([recipe], connections, codecs, channels)();
      request = supertest(api.app);

      request
      .get('/file')
      .set('Origin', 'localhost')
      .expect('Access-Control-Allow-Origin', 'http://localhost')
      .end(done)
      ;
    });

    it('returns a credentials CORS header', function(done) {
      process.env.CORS_ENABLED = true;
      process.env.CORS_ORIGIN = 'http://localhost';
      process.env.CORS_CREDENTIALS = true;
      api = uut([recipe], connections, codecs, channels)();
      request = supertest(api.app);

      request
      .get('/file')
      .set('Origin', 'localhost')
      .expect('Access-Control-Allow-Credentials', 'true')
      .end(done)
      ;
    });
  });
});
