'use strict';

const es = require('vinyl-elasticsearch');

const WriteCollection = require('./WriteCollection');

class ElasticSearchCollection extends WriteCollection {
  constructor(glob, opt) {
    super();
    this._output = es.dest(glob, opt);
  }
};

module.exports = ElasticSearchCollection;
