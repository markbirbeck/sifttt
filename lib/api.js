'use strict';
var _ = require('lodash');
const h = require('highland');
var minimist = require('minimist');
var File = require('vinyl');
var streamFromRecipe = require('./streamFromRecipe');
var server = require('./server');

var createDest = function(res) {
  var dest = function(glob, opt) {
    opt = opt || {};

    return h()
    .doto(_file => {

      /**
       * Gulp is using an older version of Vinyl so wrap our file object
       * with the latest version:
       *
       * (The File object doesn't copy custom properties so we need to
       * do it.)
       */

      var file = new File(_file);

      file.meta = _file.meta;

      /**
       * Combine any options passed here with options on the file itself,
       * giving priority to the options passed in:
       */

      _.merge({}, file.meta, opt);

      /**
       * If we can get a content type from the file name then use that,
       * otherwise see if one is set in the meta property:
       */

      /**
       * [TODO] The sequence should probably be:
       *
       *  - use opt first;
       *  - then use the file's name;
       *  - and then finally use the file's meta.
       */

      if (file.path && file.extname) {
        res.type(file.extname);
      } else if (opt['content-type']) {
        res.set('Content-Type', opt['content-type']);
      }
      res.send(file.contents);
    });
  };

  return dest;
}

var createApi = function(recipes, connections, codecs, channels) {

  /**
   * We need the parameter so that Gulp knows that the task is not finished:
   */

  return function(cb) { // eslint-disable-line no-unused-vars

    /**
     * Grab any command-line arguments and launch a server:
     */

    var knownOptions = {
      string: 'port',
      string: 'static.mount',
      string: 'static.path',
      boolean: 'cors.enabled',
      boolean: 'cors.origin',
      boolean: 'cors.credentials',
      default: {
        port: process.env.PORT || 3000,
        'cors.enabled': process.env.CORS_ENABLED === 'true',
        'cors.origin': process.env.CORS_ORIGIN === 'true' || process.env.CORS_ORIGIN,
        'cors.credentials': process.env.CORS_CREDENTIALS === 'true'
      }
    };
    var options = minimist(process.argv.slice(2), knownOptions);
    var api = server(options);

    /**
     * Create endpoints that correspond to each of the recipes:
     */

    recipes.forEach(function(recipe) {
      var r = _.cloneDeep(recipe);

      /**
       * Only turn the task into an endpoint if it's not scheduled:
       */

      if (!(r.input && r.input.schedule)) {
        r.output.channel = 'api';
      }

      /**
       * Run the recipe, passing in the request query parameters as input
       * options:
       */

      var handleTask = function(req, res) {
        channels.api = {dest: createDest(res)};

        return streamFromRecipe(r, connections, codecs, channels, req.query);
      };

      var taskName = recipe.name;

      api.app.get('/' + (taskName === 'default' ? '' : taskName), handleTask);
      api.app.post('/' + (taskName === 'default' ? '' : taskName), handleTask);
    });
    return api;
  };
};

module.exports = createApi;
