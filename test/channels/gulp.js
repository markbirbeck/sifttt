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
   * These two recipes pass multiple files through:
   */

  {
    input: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'file?.json')
    },
    output: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'output')
    },
    filter: [
      {
        mutate: {
          if: '#{hello}',
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

  {
    input: {
      channel: 'gulp',
      glob: [
        path.join(__dirname, '..', 'fixtures', 'file3.json'),
        path.join(__dirname, '..', 'fixtures', 'file2.json')
      ]
    },
    output: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'output')
    },
    filter: [
      {
        mutate: {
          if: '#{filename}',
          source: '#{filename}',
          target: 'myname'
        }
      },
      {
        mutate: {
          removeField: ['filename']
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
var codecs = {};
var channels = require('../../lib/channels')(connections, codecs, recipes);

describe('gulp channel', function() {
  it('should read and write a file', function(done) {
    uut(recipes[0], connections, codecs, channels)
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

  it('should not fail with non-JSON', function(done) {
    uut(recipes[1], connections, codecs, channels)
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
    uut(recipes[2], connections, codecs, channels)
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

  describe('should mutate multiple files', function() {
    it('using wildcard', function(done) {
      uut(recipes[3], connections, codecs, channels)
      .toArray(function(fileList) {
        fileList.should.have.length(2);

        JSON.parse(String(fileList[0].contents))
        .should.eql({'goodbye': 'there'});

        JSON.parse(String(fileList[1].contents))
        .should.eql({'filename': 'file2.json'});
        done();
      })
      ;
    });

    it('using a list', function(done) {
      uut(recipes[4], connections, codecs, channels)
      .toArray(function(fileList) {
        fileList.should.have.length(2);

        JSON.parse(String(fileList[0].contents))
        .should.eql({'myname': 'file2.json'});

        JSON.parse(String(fileList[1].contents))
        .should.eql({'hello': 'there'});
        done();
      })
      ;
    });
  });

  it('should run a recipe', function(done) {
    var fileList = [];

    uut(recipes[5], connections, codecs, channels)

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
