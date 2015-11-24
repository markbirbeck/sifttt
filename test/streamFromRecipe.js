var path = require('path');
require('chai').should();
var uut = require('../lib/streamFromRecipe2');

var recipes = [
  {
    input: {
      channel: 'gulp',
      glob: path.join(__dirname, 'fixtures', 'file.json')
    },
    output: {
      channel: 'gulp',
      glob: path.join(__dirname, 'fixtures', 'output')
    }
  },
  {
    input: {
      channel: 'gulp',
      glob: path.join(__dirname, 'fixtures', 'file.json')
    },
    output: {
      channel: 'gulp',
      glob: path.join(__dirname, 'fixtures', 'output')
    },
    filter: [
      {
        mutate: {
          source: '#{hello}',
          target: 'goodbye'
        }
      },
      {
        mutate: {
          removeField: ['hello']
        }
      }
    ]
  }
];
var connections = {};
var channels = require('../lib/channels')(connections, recipes);

describe('gulp channel', function() {
  it('should read and write a file', function(done) {
    uut(recipes[0], connections, channels)
    .toArray(function(fileList) {
      fileList.forEach(function(file) {
        var data = JSON.parse(String(file.contents));

        data.should.eql({'hello': 'world'});
      });
      done();
    })
    ;
  });

  it('should mutate a file', function(done) {
    uut(recipes[1], connections, channels)
    .toArray(function(fileList) {
      fileList.forEach(function(file) {
        var data = JSON.parse(String(file.contents));

        data.should.eql({'goodbye': 'world'});
      });
      done();
    })
    ;
  });
});
