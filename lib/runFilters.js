var _ = require('lodash');
var h = require('highland');

var filters = require('./filters');

module.exports = function(recipe, toVinyl) {
  return function(err, file, push, next) {
    var dropRecord = false;

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

    if (recipe.filter) {
      var data = file.data;

      recipe.filter.forEach(function(filter) {
        if (filter.geoip) {
          data = filters.geoip(filter.geoip, data);
        }

        if (filter.json) {
          data = filters.json(filter.json, data);
        }

        if (filter.mutate) {
          data = filters.mutate(filter.mutate, data);
        }

        if (filter.split) {
          var split = filter.split;
          var field = split.field;

          /**
           * Even if there is only one item we pass it through the split
           * pipeline and drop the current record:
           */

          var toSplit = data[field];

          if (!Array.isArray(toSplit)) {
            toSplit = [toSplit];
          }

          toSplit
            .forEach(function(entry) {
              var dataNew = _.clone(data);

              dataNew[field] = entry;
              if (split.filter) {
                split.filter.forEach(function(filterDash) {
                  if (filterDash.mutate) {
                    dataNew = filters.mutate(filterDash.mutate, dataNew);
                  }
                });
              }
              push(null, toVinyl(dataNew));
            });
          dropRecord = true;
        }
      });
      file.data = data;
    }
    if (!dropRecord) {
      push(null, file);
    }
    next();
    return;
  };
};
