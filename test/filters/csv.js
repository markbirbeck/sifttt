require('chai').should();
var uut = require('../../lib/filters/csv');

describe('csv', function() {
  it('parse with columns', function() {
    uut(
      {
        source: '#{a}',
        target: 'b',
        columns: [
          'whom',
          'greeting'
        ]
      },
      {a: 'world,hello'}
    )
    .should.eql({
      a: 'world,hello',
      b: {
        'greeting': 'hello',
        'whom': 'world'
      }
    });
  });
});
