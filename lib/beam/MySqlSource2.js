'use strict';
const MySqlSource = require('sifttt/lib/beam/MySqlSource');
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

class MySqlSource2 extends MySqlSource {
  constructor(opts) {
    let query = `
      ${phrase('SET SESSION sql_mode =', opts.mode && (opts.mode + ';'))}
      ${phrase('SELECT', opts.select)}
      ${phrase('FROM', opts.from)}
      ${phrase('WHERE', opts.where, 'AND')}
      ${phrase('LIMIT', opts.limit)}
      ;
    `;

    if (opts.dryrun || opts.verbose) {
      console.error(`About to run query: ${query}`);
      if (opts.dryrun) {
        process.exit();
      }
    }

    /**
     * If there's an sql_mode command at the beginning then we need to allow
     * for multiple statements to be run, and also drop the first result:
     */

    super(
      query,
      {
        multipleStatements: (opts.mode) ? true : false,
        drop: (opts.mode) ? 1 : 0,
        host: opts.dbhostReadonly,
        user: opts.dbuser,
        password: opts.dbpass,
        database: opts.database
      }
    );
  }

  getStream() {
    return h(super.getStream())
    .drop(this._options.drop);
  }
}

module.exports = MySqlSource2;
