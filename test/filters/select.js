'use strict';
require('chai').should();
var uut = require('../../lib/filters/select');

describe('select', function() {
  it('select matching values', () => {
    let data = uut(
      {
        source: '#{buckets}',
        keys: ['iPhone', 'iPad', 'iPod Touch'],
        keyProperty: 'id',
        // negate: true,
        target: 'iOS'
      },
      {
        buckets: [
          { id: 'webplayer', value: 1453 },
          { id: 'iPhone', value: 1000 },
          { id: 'iPod Touch', value: 15 },
          { id: 'iPad', value: 30 }
        ]
      }
    );

    data
    .should.have.property('iOS')
    .that.deep.equals([
      { id: 'iPhone', value: 1000 },
      { id: 'iPod Touch', value: 15 },
      { id: 'iPad', value: 30 }
    ]);
  });

  it('remove matching values', () => {
    let data = uut(
      {
        source: '#{buckets}',
        keys: ['iPhone', 'iPad', 'iPod Touch'],
        keyProperty: 'id',
        negate: true,
        target: 'not iOS'
      },
      {
        buckets: [
          { id: 'webplayer', value: 1453 },
          { id: 'iPhone', value: 1000 },
          { id: 'iPod Touch', value: 15 },
          { id: 'iPad', value: 30 }
        ]
      }
    );

    data
    .should.have.property('not iOS')
    .that.deep.equals([
      { id: 'webplayer', value: 1453 }
    ]);
  });
});
