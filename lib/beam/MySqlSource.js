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
    .on('end', function() {
      this._connection.end();
    })
    .stream();
  }
}

module.exports = MySqlSource;
