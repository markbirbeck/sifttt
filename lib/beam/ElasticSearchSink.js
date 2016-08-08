'use strict';

const es = require('vinyl-elasticsearch');

class ElasticSearchSink {
  constructor() {
    this._opts = {};
  }

  host(host) {
    this._opts.host = host;

    return this;
  }

  retries(retries) {
    this._opts.retries = retries;

    return this;
  }

  manageTemplate(manageTemplate) {
    this._opts.manageTemplate = manageTemplate;

    return this;
  }

  templateName(templateName) {
    this._opts.templateName = templateName;

    return this;
  }

  templateOverwrite(templateOverwrite) {
    this._opts.templateOverwrite = templateOverwrite;

    return this;
  }

  templateDir(templateDir) {
    this._opts.templateDir = templateDir;

    return this;
  }

  getStream() {
    return es.dest({}, this._opts);
  }
}

module.exports = ElasticSearchSink;
