'use strict';

const h = require('highland');

const ReadCollection = require('./ReadCollection');

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

class InputCollection extends ReadCollection {
  constructor(source) {
    super();
    this._input = h(source);
  }
};

module.exports = InputCollection;
