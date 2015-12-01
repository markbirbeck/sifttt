var path = require('path');
require('chai').should();
var supertest = require('supertest');
var uut = require('../lib/api');

var recipe = {
  name: 'file',
  input: {
    channel: 'gulp',
    glob: path.join(__dirname, 'fixtures', 'file.json')
  },
  output: {
    channel: 'gulp',
    glob: path.join(__dirname, 'fixtures', 'output')
  }
};
var connections = {};
var channels = require('../lib/channels')(connections, [recipe]);

var api = uut([recipe], connections, channels);
var request = supertest(api());

describe('api', function() {
  it('return file using recipe', function(done) {
    request
    .get('/file')
    .expect(200, {hello: 'world'}, done)
    ;
  });
});
