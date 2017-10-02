'use strict';
const PgSource = require('sifttt-source-pg');
const h = require('highland');

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

class PgSource2 extends PgSource {
  constructor(opts) {
    let query = `
      ${phrase('SELECT', opts.select)}
      ${phrase('FROM', opts.from)}
      ${phrase('WHERE', opts.where, 'AND')}
      ${phrase('ORDER BY', opts.orderBy)}
      ${phrase('LIMIT', opts.limit)}
      ;
    `;

    if (opts.dryrun || opts.verbose) {
      console.error(`About to run query: ${query}`);
      if (opts.dryrun) {
        process.exit();
      }
    }

    super(
      query/*,
      {
        host: opts.dbhostReadonly,
        user: opts.dbuser,
        password: opts.dbpass,
        database: opts.database
      }*/
    );
  }

  getStream() {
    return h(super.getStream());
  }
}

module.exports = PgSource2;
