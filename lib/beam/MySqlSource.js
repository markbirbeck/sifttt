'use strict';

const mysql = require('mysql');

class MySqlSource {
  constructor(source, options) {
    this._connection = mysql.createConnection(options);
    this._source = source;
    this._options = options;
  }

  getStream() {
    return this._connection.query(this._source)
    .stream();
  }
}

module.exports = MySqlSource;
