'use strict';


const es = require('vinyl-elasticsearch');

class ElasticSearchSource {
  constructor() {
    this._opts = {};
    this._match = [];
    this._missing = [];
    this._sort = [];
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

  size(size) {
    this._size = size;

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

  sort(field, order) {
    this._sort.push({
      [field]: {
        order: order || 'asc'
      }
    });

    return this;
  }

  term(field, value) {
    this._term.push({[field]: value});

    return this;
  }

  match(field, value) {
    this._match.push({[field]: value});

    return this;
  }

  missing(field) {
    this._missing.push({field: field});

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

    glob.size = this._size;

    this._match.forEach(match => {
      glob.body.query.filtered.filter.bool.must.push({
        match: match
      });
    })

    this._missing.forEach(m => {
      glob.body.query.filtered.filter.bool.must.push({
        missing: m
      });
    })

    if (this._sort.length) {
      glob.body.sort = [];

      this._sort.forEach(sort => {
        glob.body.sort.push(sort);
      })
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
