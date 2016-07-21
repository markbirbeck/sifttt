'use strict';
const mysql = require('mysql');

module.exports = (options) => {
  let connection = mysql.createConnection(options.connection);
  let hadSomeResults = false;

  return new Promise((resolve, reject) => {
    connection.query(options.query)
    .on('error', function(err) {
      reject(`Error in mysql: ${err}`);
    })
    .on('result', function(row) {
      hadSomeResults = true;
      resolve(row);

      /**
       * [TODO] Would be good to be smart about this:
       */

      connection.end();
    })
    .on('end', function() {

      /**
       * If there are no results we just get an 'end' event without
       * getting any 'record' events, so return an empty record:
       */

      if (!hadSomeResults) {
        resolve({});
      }
    });
  });
}
