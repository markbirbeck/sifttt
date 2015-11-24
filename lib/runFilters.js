var _ = require('lodash');
var h = require('highland');

module.exports = function(recipe, json, mutate, toVinyl) {
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
        if (filter.json) {
          data = json(filter.json, data);
        }

        if (filter.mutate) {
          data = mutate(filter.mutate, data);
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
                    dataNew = mutate(filterDash.mutate, dataNew);
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
