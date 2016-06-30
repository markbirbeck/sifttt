'use strict';
var _ = require('lodash');
var h = require('highland');

var _filters = require('./filters');

/**
 * [TODO] This is getting ripe for a good old refactor.
 */

module.exports = (recipe, toVinyl, wrapper) => {
  var filters = _filters(wrapper);

  return function(s) {
    if (recipe.filter) {
      let savedFile;

      s = s.map(function(file) {
        savedFile = file;
        let data = file.data || {message: String(file.contents)};

        data['@meta'] = {};

        if (recipe.input.params) {
          data['@meta'].params = recipe.input.params;
        }
        return data;
      });

      recipe.filter.forEach(function(filter) {
        if (filter.csv) {
          s = s.map(function(data) {
            return filters.csv(filter.csv, data);
          })
        }

        if (filter.geocode) {
          s = s.flatMap(function(data) {
            return h(filters.geocode(filter.geocode, data));
          });
        }

        if (filter.geohash) {
          s = s.map(function(data) {
            return filters.geohash(filter.geohash, data);
          })
        }

        if (filter.geoip) {
          s = s.map(function(data) {
            return filters.geoip(filter.geoip, data);
          })
        }

        if (filter.generate) {
          s = s.flatMap(function(data) {
            return filters.generate(filter.generate, data);
          });
        }

        if (filter.javascript) {
          s = s.map(function(data) {
            return filters.javascript(filter.javascript, data);
          })
        }

        if (filter.json) {
          s = s.map(function(data) {
            return filters.json(filter.json, data);
          })
        }

        if (filter.moment) {
          s = s.map(data => filters.moment(filter.moment, data));
        }

        if (filter.mutate) {
          s = s.map(function(data) {
            return filters.mutate(filter.mutate, data);
          })
        }

        if (filter.paginate) {
          s = s.map(function(data) {
            return filters.paginate(filter.paginate, data);
          })
        }

        if (filter.select) {
          s = s.map(function(data) {
            return filters.select(filter.select, data);
          })
        }

        if (filter.sum) {
          s = s.map(function(data) {
            return filters.sum(filter.sum, data);
          })
        }

        if (filter.split) {
          s = s.consume(function(err, data, push, next) {

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

            if (data === h.nil) {
              push(null, data);
              return;
            }

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
            next();
          });
        }

        if (filter.weather) {
          s = s.flatMap(function(data) {
            return h(filters.weather(filter.weather, data));
          });
        }
      });

      // s = s.map(function(data) {
      //   _.unset(data, '@meta');
      //   return _.merge({}, savedFile, {data});
      // });

      s = s.map(function(data) {
        _.unset(data, '@meta');
        let newFile = _.cloneDeep(savedFile);
        newFile.data = data;
        return newFile;
      });
    }

    return s;
  }
};
