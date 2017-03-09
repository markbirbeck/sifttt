const path = require('path');

exports.command = 'elasticsearch [options]';

exports.describe = 'write output to an ElasticSearch cluster';

exports.builder = {
  elasticsearchHost: {
    alias: 'host',
    demand: true
  },
  elasticsearchIndexInput: {
    alias: 'indexInput'
  },
  indexOutput: {
    alias: 'elasticsearchIndexOutput',
    type: 'string'
  },
  elasticsearchRetries: {
    alias: 'retries',
    type: 'number'
  },
  elasticsearchManageTemplate: {
    alias: 'manageTemplate',
    type: 'boolean'
  },
  elasticsearchTemplate: {
    alias: 'templateName'
  },
  elasticsearchTemplateOverwrite: {
    alias: 'templateOverwrite',
    type: 'boolean'
  },
  elasticsearchTemplateDir: {
    alias: 'templateDir',
    default: path.relative(process.cwd(), 'templates')
  },
  elasticsearchRateLimit: {
    alias: 'rateLimit',
    type: 'number'
  },
  elasticsearchBatchTimeout: {
    alias: 'batchTimeout',
    type: 'number'
  },
  elasticsearchBatchSize: {
    alias: 'batchSize',
    type: 'number'
  },
  elasticsearchMaxRetries: {
    alias: 'maxRetries',
    type: 'number',
    default: /* process.env.ELASTICSEARCH_RETRIES || */ 3
  },
  elasticsearchRequestTimeout: {
    alias: 'requestTimeout',
    type: 'number',
    default: 30
  }
}

exports.handler = (argv) => {
  argv.modulePath = 'sifttt/lib/beam/ElasticSearchSink';
}
