'use strict';

/**
 * Test the 'line' codec in a recipe:
 */

var path = require('path');
require('chai').should();
let uut = require('../../lib/streamFromRecipe');

let recipes = [
  {
    name: 'read',
    input: {
      channel: 'gulp',
      glob: [
        path.join(__dirname, '../fixtures/file.csv'),
        path.join(__dirname, '../fixtures/file2.csv')
      ],
      opts: { buffer: false },
      codec: {
        line: {
          drop: 1
        }
      }
    },
    output: {
      channel: 'noop'
    },
    filter: [
      {
        csv: {
          columns: [
            'greeting'
          ]
        }
      }
    ]
  }
];

let connections = {};
let codecs = require('../../lib/codecs');
let channels = require('../../lib/channels')(connections, codecs, recipes);

describe('line codec in a recipe', function() {
  it('should read', function(done) {
    uut(recipes[0], connections, codecs, channels)
    .collect()
    .doto(ar => {
      ar
      .map(file => JSON.parse(String(file.contents)))
      .should.eql([
        {
          'message': 'hello',
          'greeting': 'hello'
        },
        {
          'message': 'bonjour',
          'greeting': 'bonjour'
        },
        {
          'message': 'howdy',
          'greeting': 'howdy'
        },

        {
          'message': 'wotcha',
          'greeting': 'wotcha'
        },
        {
          'message': 'bona sera',
          'greeting': 'bona sera'
        }
      ]);
    })
    .done(done)
    ;
  });
});
