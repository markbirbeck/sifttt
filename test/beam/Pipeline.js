'use strict';
require('chai').should();

const Pipeline = require('../../lib/beam/Pipeline');
const InputCollection = require('../../lib/beam/InputCollection');
const ct = require('../../lib/beam/coreTransforms');

describe('Pipeline', () => {
  it('core transforms', done => {
    let p = Pipeline.create({rethrowErrors: true})
    .apply(new InputCollection([4, 3, 2, 1]))
    .apply(new ct.Map(element => element - 8))
    .apply(new ct.Collect())
    .apply(new ct.DoTo(ar => {
      ar.should.eql([
        4 - 8,
        3 - 8,
        2 - 8,
        1 - 8
      ]);
    }))
    ;

    p.run(done);
  });

  it('Otherwise', done => {
    let p = Pipeline.create({rethrowErrors: true})
    .apply(new InputCollection([]))
    .apply(new ct.Otherwise([8, 7, 6, 5]))
    .apply(new ct.Map(element => element - 4))
    .apply(new ct.Collect())
    .apply(new ct.DoTo(ar => {
      ar.should.eql([
        8 - 4,
        7 - 4,
        6 - 4,
        5 - 4
      ]);
    }))
    ;

    p.run(done);
  });
});
