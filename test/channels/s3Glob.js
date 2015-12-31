'use strict';
let path = require('path');
require('chai').should();
let uut = require('../../lib/streamFromRecipe');
let params = {
  Bucket: process.env.S3_BUCKET,
  Delimiter: '/',
  EncodingType: 'url',
  Marker: 'STRING_VALUE',
  MaxKeys: 0,
  Prefix: `${process.env.S3_PATH_PREFIX}/${process.env.DATE_TO_IMPORT}`
};

var recipes = [
  {
    input: {
      channel: 's3Glob',
      glob: `s3://${params.Bucket}/${params.Prefix}/*`
    },
    output: {
      channel: 'gulp',
      glob: path.join(__dirname, '..', 'fixtures', 'output')
    }
  }
];
var connections = {};

var channels = require('../../lib/channels')(connections, recipes);

describe('s3Glob channel', function() {
  it('should get folder count', function(done) {
    this.timeout(10000);
    let count = 0;

    uut(recipes[0], connections, channels)
    .each(() => count++)
    .done(() => {
      count
      .should.be.at.least(1000);
      done();
    })
    ;
  });
});
