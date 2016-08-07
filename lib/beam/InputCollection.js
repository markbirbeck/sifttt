'use strict';

const h = require('highland');

/**
 * In Beam parlance the data source is an input collection, which is
 * a special kind of transform for a Pipeline:
 *
 *  new Pipeline()
 *  .apply(new InputCollection([1, 2, 3, 4]))
 *  .apply(Doto(element => {
 *    console.log(`Got an element: ${JSON.stringify(element)}`);
 *  }))
 *  ;
 */

class InputCollection {
  constructor(source) {
    this._input = h(source);
  }

  apply() {
    return h.through(this._input);
  }
};

module.exports = InputCollection;
