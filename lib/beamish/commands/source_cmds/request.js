exports.command = 'request [options]';

exports.describe = 'get input from a URL';

exports.builder = {
  uri: {
    demand: true
  },
  strictSSL: {
    type: 'boolean'
  }
}

exports.handler = (argv) => {
  argv.modulePath = 'sifttt/lib/beam/RequestSource';
}
