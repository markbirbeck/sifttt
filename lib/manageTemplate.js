var path = require('path');

var _ = require('lodash');
var es = require('elasticsearch');

function createTemplate(client, templateName, templateDir, overwrite) {
  var params = {name: templateName};

  client.indices.existsTemplate(params)
    .then(function(exists) {
      if (!exists || overwrite) {
        params.body = require(path.join(templateDir, templateName + '.json'));

        client.indices.putTemplate(params)
          .catch(function(err) {
            console.error('Failed to create template \'', templateName, '\':',
              err);
          });
      }
    })
    .catch(function(err) {
      console.error('Failed checking if template \'', templateName,
        '\' exists:', err, params);
    });
}

module.exports = function(_opts) {
  var opts = _.clone(_opts);
  var manageTemplate = (!('manageTemplate' in opts) || opts.manageTemplate);

  if (manageTemplate) {
    var client = new es.Client(opts);

    client.ping(
      {requestTimeout: 30000},
      function(error) {
        if (error) {
          console.error('Unable to create template since ElasticSearch',
            'cluster is not available:', error);
        } else {
          opts.templateName.split(/\s*,\s*/).forEach(function(name) {
            createTemplate(client, name, opts.templateDir,
              opts.templateOverwrite);
          });
        }
      }
    );
  }
}
