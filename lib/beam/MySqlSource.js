'use strict';

const mysql = require('mysql');

class MySqlSource {
  constructor(source, params, options) {
    if (!options) {
      if (typeof(params) === 'object') {
        options = params;
        params = [];
      } else {
        options = {};
      }
    }
    if (!Array.isArray(params)) {
      params = [];
    }
    this._source = source;
    this._params = params;
    this._options = options;
    this._connection = mysql.createConnection(this._options);
  }

  getStream() {
    return this._connection.query(this._source, this._params)
    .on('end', function() {
      this._connection.end();
    })
    .stream();
  }
}

module.exports = MySqlSource;
