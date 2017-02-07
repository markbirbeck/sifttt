'use strict';
require('chai').should();

const Pipeline = require('../../lib/beam/Pipeline');
const MySqlSource = require('../../lib/beam/MySqlSource');
const Read = require('../../lib/beam/Read');
const ct = require('../../lib/beam/coreTransforms');

describe('MySqlSource', () => {
  /**
   * [TODO] Skipping because don't have a test that can be run from
   *        Wercker, so need to set that up:
   */

  it.skip('simple db read', done => {
    let p = Pipeline.create()
    .apply(Read.from(new MySqlSource(
      `
        SELECT
          t2.*,
          t3.*
        FROM
          state51__Base t2,
          state51__GreedOrder t3,
          state51__Base t4,
          state51__GreedOrderLine t5,
          state51__Base t6,
          state51__StockQuote t7
        WHERE
          t2.id = t3.id
          AND
          (
            t5.stockquote = t6.id
            AND
            t5.greedorder = t2.id
            AND
            t3.status = 'complete'
            AND
            t7.source = 1396680
            AND
            t3.transaction_time >= 2016
          )
          AND
          t7.id = t6.id
          AND
          t6._type IN (142)
          AND
          t5.id = t4.id
          AND
          t4._type IN (141, 275)
        LIMIT 10
      `, {
        host: process.env.DBHOST_READONLY,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DATABASE
      }
    )))
    .apply(new ct.DoTo(element => {
      element.should.have.property('id');
    }))
    .apply(new ct.Collect())
    .apply(new ct.DoTo(element => {
      element.should.have.length(10);
    }))
    ;

    p.run(done);
  });

  it.skip('use parameters', done => {
    let p = Pipeline.create()
    .apply(Read.from(new MySqlSource(
      `
        SELECT
          t2.*,
          t3.*
        FROM
          state51__Base t2,
          state51__GreedOrder t3,
          state51__Base t4,
          state51__GreedOrderLine t5,
          state51__Base t6,
          state51__StockQuote t7
        WHERE
          t2.id = t3.id
          AND
          (
            t5.stockquote = t6.id
            AND
            t5.greedorder = t2.id
            AND
            t3.status = ?
            AND
            t7.source = ?
            AND
            t3.transaction_time >= ?
          )
          AND
          t7.id = t6.id
          AND
          t6._type IN (142)
          AND
          t5.id = t4.id
          AND
          t4._type IN (141, 275)
        LIMIT 10
      `,
      ['complete', 1396680, 2016],
      {
        host: process.env.DBHOST_READONLY,
        user: process.env.DBUSER,
        password: process.env.DBPASS,
        database: process.env.DATABASE
      }
    )))
    .apply(new ct.DoTo(element => {
      element.should.have.property('id');
    }))
    .apply(new ct.Collect())
    .apply(new ct.DoTo(element => {
      element.should.have.length(10);
    }))
    ;

    p.run(done);
  });
});
