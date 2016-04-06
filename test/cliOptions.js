var path = require('path');
require('chai').should();
var uut = require('../lib/streamFromRecipe');

var recipe = {
  name: 'read and write',
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
var codecs = {};
var channels = require('../lib/channels')(connections, [recipe]);

describe('command-line options', function() {
  it('should work without options', function(done) {
    uut(recipe, connections, codecs, channels)
    .toArray(function(fileList) {
      fileList.should.have.length(1);
      fileList.forEach(function(file) {
        var data = JSON.parse(String(file.contents));

        data.should.eql({'hello': 'world'});
      });
      done();
    })
    ;
  });

  it('should work with empty options', function(done) {
    uut(recipe, connections, codecs, channels)
    .toArray(function(fileList) {
      fileList.should.have.length(1);
      fileList.forEach(function(file) {
        var data = JSON.parse(String(file.contents));

        data.should.eql({'hello': 'world'});
      });
      done();
    })
    ;
  });

  it('option to override glob', function(done) {
    uut(recipe, connections, codecs, channels,
      {override: `input.glob=${path.join(__dirname, 'fixtures', 'file2.json')}`})
    .toArray(function(fileList) {
      fileList.should.have.length(1);
      fileList.forEach(function(file) {
        var data = JSON.parse(String(file.contents));

        data.should.eql({'hello': 'there'});
      });
      done();
    })
    ;
  });
});
