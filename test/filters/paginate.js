'use strict';
require('chai').should();

let uut = require('../../lib/filters/paginate');

describe('pagination', () => {
  it('should get first page', () => {
    let data = uut(
      {
        source: 'buckets',
        size: 2,
        page: 1
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
    .should.have.property('pagination')
    .that.deep.equals({page: 1, size: 2, count: 4});
    data
    .should.have.property('buckets')
    .that.deep.equals([
      { id: 'webplayer', value: 1453 },
      { id: 'iPhone', value: 1000 }
    ]);
  });

  it('should get second page', () => {
    let data = uut(
      {
        source: 'buckets',
        size: 2,
        page: 2
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
    .should.have.property('pagination')
    .that.deep.equals({page: 2, size: 2, count: 4});
    data
    .should.have.property('buckets')
    .that.deep.equals([
      { id: 'iPod Touch', value: 15 },
      { id: 'iPad', value: 30 }
    ]);
  });

  it('should assign selected page to named target', () => {
    let data = uut(
      {
        source: 'buckets',
        target: 'page2',
        size: 2,
        page: 2
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
    .should.have.property('pagination')
    .that.deep.equals({page: 2, size: 2, count: 4});
    data
    .should.have.property('buckets')
    .that.deep.equals(data.buckets);
    data
    .should.have.property('page2')
    .that.deep.equals([
      { id: 'iPod Touch', value: 15 },
      { id: 'iPad', value: 30 }
    ]);
  });

  it('should assign pagination state to named target', () => {
    let data = uut(
      {
        source: 'buckets',
        state: 'pageState',
        size: 2,
        page: 2
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
    .should.not.have.property('pagination');
    data
    .should.have.property('pageState')
    .that.deep.equals({page: 2, size: 2, count: 4});
    data
    .should.have.property('buckets')
    .that.deep.equals([
      { id: 'iPod Touch', value: 15 },
      { id: 'iPad', value: 30 }
    ]);
  });
});
