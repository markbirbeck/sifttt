'use strict';
const MySqlSource = require('sifttt/lib/beam/MySqlSource');

let phrase = (prefix, values, separator) => {
  let ret = '';

  if (values) {
    ret = prefix + ' ' + (
      (Array.isArray(values))
        ? values.join(separator && ` ${separator} `)
        : values
      );
  }
  return ret;
};

class MySqlSource2 extends MySqlSource {
  constructor(opts) {
    let query = `
      ${phrase('SELECT', opts.select)}
      ${phrase('FROM', opts.from)}
      ${phrase('WHERE', opts.where, 'AND')}
      ${phrase('LIMIT', opts.limit)}
      ;
    `;

    if (opts.verbose) {
      console.error(`About to run query: ${query}`);
    }

    super(
      query,
      {
        host: opts.dbhostReadonly,
        user: opts.dbuser,
        password: opts.dbpass,
        database: opts.database
      }
    );
  }
}

module.exports = MySqlSource2;
