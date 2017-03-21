'use strict';
const ElasticSearchSource = require('sifttt/lib/beam/ElasticSearchSource');

class ElasticSearchSource2 extends ElasticSearchSource {
  constructor(opts) {
    super();

    if (opts) {
      this._opts = opts;
      this._match = opts.elasticsearchMatch || [];
      this._missing = opts.elasticsearchMissing || [];
      this._sort = opts.elasticsearchSort || [];
      this._term = opts.elasticsearchTerm || [];
      this._type = opts.elasticsearchType || [];
      this._notTerm = opts.elasticsearchNotTerm || [];
    }
  }
}

module.exports = ElasticSearchSource2;
