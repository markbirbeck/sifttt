'use strict';
const path = require('path');

require('chai').should();

const Pipeline = require('../../lib/beam/Pipeline');
const GulpCollection = require('../../lib/beam/GulpCollection');
const ct = require('../../lib/beam/coreTransforms');

describe('GulpCollection', () => {
  it('simple file read', done => {
    let p = new Pipeline()
    .apply(new GulpCollection(path.join(__dirname, '..', 'fixtures', 'file.json')))
    .apply(new ct.ParseJSON())
    .apply(new ct.DoTo(element => {
      element.should.have.property('data');
    }))
    .apply(new ct.Map(element => element.data))
    .apply(new ct.DoTo(element => {
      element.should.have.property('hello', 'world');
    }))
    ;

    p.run(done);
  });
});
