'use strict';
const request = require('request');

module.exports = (options) => {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(`Error '${error}' posting to '${JSON.stringify(options)}'`);
      } else {
        resolve(body);
      }
    })
    ;
  });
}
