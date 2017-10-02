exports.command = 'pg [options]';

exports.describe = 'get input from a Postgres SQL query';

exports.builder = {
  select: {
    demand: true,
    array: true
  },
  from: {
    demand: true,
    array: true
  },
  where: {
    demand: true,
    array: true
  },
  orderBy: {
    array: true
  },
  limit: {
    type: 'number'
  }
}

exports.handler = (argv) => {
  argv.modulePath = 'sifttt/lib/beam/PgSource2';
}
