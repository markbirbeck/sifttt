require('chai').should();
var uut = require('../../lib/streamFromRecipe');

var recipes = [
  {
    input: {
      channel: 'elasticsearch',
      glob: {
        index: 'logstash-*',
        size: 0,
        body: {
          // Begin query.
          query: {
            // Boolean query for matching and excluding items.
            bool: {
              must: [{match: {'actionStatus': 'CompletedActionStatus'}}]
            }
          },
          // Aggregate on the results
          aggs: {
            actions: {
              terms: {
                field: 'additionalType',
                order: {'_term' : 'asc'},
                size: 10,
              }
            }
          }
        }
      }
    },
    output: {
      channel: 'noop'
    }
  }
];
var connections = {
  'elasticsearch': {
    host: process.env.ELASTICSEARCH_HOST,
    amazonES: {
      region: process.env.ELASTICSEARCH_AWS_DEFAULT_REGION,
      accessKey: process.env.ELASTICSEARCH_AWS_ACCESS_KEY_ID,
      secretKey: process.env.ELASTICSEARCH_AWS_SECRET_ACCESS_KEY
    }
  }
};
var codecs = {};
var channels = require('../../lib/channels')(connections, recipes);

describe('elasticsearch channel', function() {
  it('should query', function(done) {
    this.timeout(5000);
    uut(recipes[0], connections, codecs, channels)
    .toArray(function(fileList) {
      fileList.forEach(function(file) {
        var data = JSON.parse(String(file.contents));

        data
        .should.have.deep.property('actions.buckets')
        .that.is.an('array');
      });
      done();
    })
    ;
  });
});
