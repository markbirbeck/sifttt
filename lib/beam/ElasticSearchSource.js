'use strict';


const es = require('vinyl-elasticsearch');

class ElasticSearchSource {
  constructor() {
    this._opts = {};
    this._term = [];
    this._notTerm = [];
  }

  host(host) {
    this._opts.host = host;

    return this;
  }

  amazonES(amazonES) {
    this._opts.amazonES = amazonES;

    return this;
  }

  retries(retries) {
    this._opts.retries = retries;

    return this;
  }

  index(index) {
    this._index = index;

    return this;
  }

  type(type) {
    this._type = type;

    return this;
  }

  term(field, value) {
    this._term.push({[field]: value});

    return this;
  }

  notTerm(field, value) {
    this._notTerm.push({[field]: value});

    return this;
  }

  getStream() {
    let glob = {
      index: this._index,
      body: {
        query: {
          filtered: {
            filter: {
              bool: {
                'must': [
                  {
                    type: {
                      value: this._type
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }

    this._term.forEach(term => {
      glob.body.query.filtered.filter.bool.must.push({
        term: term
      });
    })

    this._notTerm.forEach(term => {
      glob.body.query.filtered.filter.bool.must.push({
        not: {
          term: term
        }
      });
    })

    return es.src(glob, this._opts);
  }
}

module.exports = ElasticSearchSource;
