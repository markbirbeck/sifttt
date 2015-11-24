var h = require('highland');

module.exports = function(_if, toVinyl) {
  return function(err, file, push, next) {

    /*
     * Forward any errors:
     */

    if (err) {
      push(err);
      next();
      return;
    }

    /**
     * Check to see if we're finished:
     */

    if (file === h.nil) {
      push(null, file);
      return;
    }

    /**
     * If we're not expanding arrays or there is no data then move on:
     */

    if (!_if.arrayExpand || (!file.data && !file.contents)) {
      push(null, file);
      next();
      return;
    }

    /**
     * If we don't have an array then there is nothing to do:
     */

    if (!Array.isArray(file.data)) {
      push(null, file);
      next();
      return;
    }

    /**
     * Finally, create a new Vinyl file for each entry in the array:
     */

    file.data
      .forEach(function(entry) {
        push(null, toVinyl(entry));
      });
    next();
  };
};
