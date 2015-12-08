require('chai').should();
var uut = require('../../lib/streamFromRecipe');

var recipes = [
  {
    input: {
      channel: 'amqp',
      glob: process.env.SQS_QUEUE_NAME,
      opts: {
        getMessageCount: true
      }
    },
    output: {
      channel: 'gulp',
      glob: '../fixtures/output'
    }
  }
];
var connections = {};

var channels = require('../../lib/channels')(connections, recipes);

describe('amqp channel', function() {
  it('should get queue count', function(done) {
    this.timeout(40000);

    uut(recipes[0], connections, channels)
    .toArray(function(fileList) {
      fileList.should.have.length(1);
      fileList.forEach(function(file) {
        var data = JSON.parse(String(file.contents));

        data
        .should.be.a('number');
      });
      done();
    })
    ;
  });
});
