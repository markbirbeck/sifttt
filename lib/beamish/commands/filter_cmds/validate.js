exports.command = 'validate [options]';

exports.describe = 'validate a record in a stream';

exports.builder = {
  schema: {
    demand: true
  }
}

exports.handler = (argv) => {
  argv.modulePath = 'sifttt/lib/beam/FilterValidate';
}
