var path = require('path');
require('chai').should();
var uut = require('../../lib/streamFromRecipe');

var recipes = [
  {
    name: 'read and write',
    input: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'file.json')
    },
    output: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'output')
    }
  },
  {
    name: 'read and write non-JSON',
    input: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'file.txt')
    },
    output: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'output')
    }
  },
  {
    input: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'file.json')
    },
    output: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'output')
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
  },

  /**
   * This recipe takes a filename from file3.json, and then uses that as the
   * 'glob' input to another recipe:
   */

  {
    input: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'file3.json')
    },
    output: {
      channel: 'runRecipe',
      glob: 'read and write'
    },
    filter: [
      {
        mutate: {
          source: path.join(__dirname, '..', 'fixtures', '#{filename}'),
          target: 'glob'
        }
      }
    ]
  }
];
var connections = {};
var channels = require('../../lib/channels')(connections, recipes);

describe('gulp channel', function() {
  it('should read and write a file', function(done) {
    uut(recipes[0], connections, channels)
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

  it.only('should not fail with non-JSON', function(done) {
    uut(recipes[1], connections, channels)
    .toArray(function(fileList) {
      fileList.should.have.length(1);
      fileList.forEach(function(file) {
        var content = String(file.contents);

        content.should.eql('This is not JSON.\n');
      });
      done();
    })
    ;
  });

  it('should mutate a file', function(done) {
    uut(recipes[2], connections, channels)
    .toArray(function(fileList) {
      fileList.should.have.length(1);
      fileList.forEach(function(file) {
        var data = JSON.parse(String(file.contents));

        data.should.eql({'goodbye': 'world'});
      });
      done();
    })
    ;
  });

  it('should run a recipe', function(done) {
    var fileList = [];

    uut(recipes[3], connections, channels)

    /**
     * For some reason we can't use toArray() when we have nested recipes:
     */

    .each(function(file) {
      fileList.push(JSON.parse(String(file.contents)));
    })
    .done(function() {
      fileList.should.have.length(1);
      fileList.forEach(function(data) {
        data.should.eql({'hello': 'there'});
      });
      done();
    })
    ;
  });
});
