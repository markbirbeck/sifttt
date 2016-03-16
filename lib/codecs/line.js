'use strict';
let h = require('highland');
let File = require('vinyl');

module.exports = (error, file, push, next) => {
  if (error) {
    push(error);
    next();
    return;
  }

  if (file === h.nil) {
    push(null, h.nil);
    return;
  }

  next(
    h(file.isStream() ? file.contents : Promise.resolve(new Buffer(file.contents)))
    .split()

    /**
     * [TODO] Make dropping the header line configurable:
     */

    .drop(1)

    /**
     * Remove blank lines:
     */

    .filter(row => row !== '')

    /**
     * For each row create a Vinyl file object:
     */

    .map(function(row) {
      let file = new File({
        contents: new Buffer(JSON.stringify({message: row}))
      });

      file.stat = {
        size: file.contents.length
      };
      return file;
    })
  );
}
