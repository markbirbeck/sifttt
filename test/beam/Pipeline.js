'use strict';
require('chai').should();

const Pipeline = require('../../lib/beam/Pipeline');
const InputCollection = require('../../lib/beam/InputCollection');
const ct = require('../../lib/beam/coreTransforms');

describe('Pipeline', () => {
  it('core transforms', done => {
    let p = Pipeline.create()
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
});
