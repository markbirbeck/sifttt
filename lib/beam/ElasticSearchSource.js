'use strict';


const es = require('vinyl-elasticsearch');

class ElasticSearchSource {
  constructor() {
    this._opts = {};
  }

  host(host) {
    this._opts.host = host;

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
    return es.src(glob, this._opts);
  }
}

module.exports = ElasticSearchSource;
