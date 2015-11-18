var h = require('highland');
var _ = require('lodash');
var File = require('vinyl');

var _json = require('./json');
var _mutate = require('./mutate');

function json(params, data) {
  try {
    return _json(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message);
  }
  return data;
}

function mutate(params, data) {
  try {
    return _mutate(params, data);
  } catch (e) {
    console.warn(data.MessageId, ':', e.message);
  }
  return data;
}

function toVinyl(obj) {
  var file = new File();
  var data = _.clone(obj);

  /**
   * Set the path of the entry to the URL property, if it exists:
   */

  file.path = data.url || '';

  /**
   * Remove the ID that comes from Google Sheets so as to avoid
   * confusion with other IDs such as those for ElasticSearch:
   */

  delete data.id;

  /**
   * Set the data properties:
   */

  file.data = data;
  file.contents = new Buffer(JSON.stringify(data));

  return file;
}

var streamFromRecipe = function(stream, recipe, connections, channels, cb) {
  var _if = recipe.input || recipe.if;
  var _then = recipe.output || recipe.then;

  _if = _.merge({opts: connections[_if.channel]}, _if);
  _then = _.merge({opts: connections[_then.channel]}, _then);

  var src = channels[_if.channel].src;
  var dest = channels[_then.channel].dest;

  return stream
    .pipe(h(src(_if.glob, _if.opts)))
    .consume(function(err, file, push, next) {

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
       * If there is no data then convert the contents to JSON:
       */

      if (!file.data) {
        file.data = JSON.parse(String(file.contents));
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
    })
    .consume(function(err, file, push, next) {
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
    })
    .map(function(file) {
      return (recipe.map) ? recipe.map(file) : file;
    })
    .pipe(dest(_then.glob, _then.opts))
    .done(cb)
    ;
}

module.exports = streamFromRecipe;