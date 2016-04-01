'use strict';
require('chai').should();
let minimist = require('minimist');
let uut = require('../lib/params');

describe('override parameters', function() {
  let obj;

  beforeEach(() => { obj = {}; });

  it('items on non-array should be merged', () => {
    let command = [
      'gulp search',
      '--override=input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds.min=2015-12-11',
      '--override=input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds.max=2015-12-18'
    ];
    let result = uut(obj, minimist(command).override);

    result.should.have.deep.property('input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds');

    let extendedBounds = result
    .input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds;

    extendedBounds.should.have.property('min', '2015-12-11');
    extendedBounds.should.have.property('max', '2015-12-18');
  });

  describe('items on same array', () => {
    it('and with same index, should be merged', () => {
      let command = [
        'gulp search',
        '--override=input.glob.body.query.filtered.filter.bool.must[0].range.startTime.gte=2015-12-11',
        '--override=input.glob.body.query.filtered.filter.bool.must[0].range.startTime.lte=2015-12-18'
      ];
      let result = uut(obj, minimist(command).override);

      result.should.have.deep.property('input.glob.body.query.filtered.filter.bool.must');

      let must = result
      .input.glob.body.query.filtered.filter.bool.must;

      must.should.have.length(1);
      must[0].range.startTime.should.have.property('gte', '2015-12-11');
      must[0].range.startTime.should.have.property('lte', '2015-12-18');
    });

    it('but with different index, should be separate', () => {
      let command = [
        'gulp search',
        '--override=input.glob.body.query.filtered.filter.bool.must[0].term.name=Google',
        '--override=input.glob.body.query.filtered.filter.bool.must[1].term.country=UK',
      ];
      let result = uut(obj, minimist(command).override);

      result.should.have.deep.property('input.glob.body.query.filtered.filter.bool.must');

      let must = result
      .input.glob.body.query.filtered.filter.bool.must;

      must.should.have.length(2);
      must[0].term.should.have.property('name', 'Google');
      must[1].term.should.have.property('country', 'UK');
    });
  });

  it('complex settings should not conflict', () => {
    let command = [
      'gulp search',
      '--override=input.glob.body.query.filtered.filter.bool.must[0].term.name=Google',
      '--override=input.glob.body.query.filtered.filter.bool.must[1].term.country=UK',
      '--override=input.glob.body.query.filtered.filter.bool.must[2].range.startTime.gte=2015-12-11',
      '--override=input.glob.body.query.filtered.filter.bool.must[2].range.startTime.lte=2015-12-18',
      '--override=input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds.min=2015-12-11',
      '--override=input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds.max=2015-12-18'
    ];
    let result = uut(obj, minimist(command).override);

    result.should.have.deep.property('input.glob.body.query.filtered.filter.bool.must');
    result.should.have.deep.property('input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds');

    let must = result
    .input.glob.body.query.filtered.filter.bool.must;
    let extendedBounds = result
    .input.glob.body.aggs.device.aggs.plays.date_histogram.extended_bounds;

    must.should.have.length(3);
    must[0].term.should.have.property('name', 'Google');
    must[1].term.should.have.property('country', 'UK');
    must[2].range.startTime.should.have.property('gte', '2015-12-11');
    must[2].range.startTime.should.have.property('lte', '2015-12-18');

    extendedBounds.should.have.property('min', '2015-12-11');
    extendedBounds.should.have.property('max', '2015-12-18');
  });

  describe('escape key names', () => {
    it('should use default escaping', () => {
      let command = [
        'gulp search',
        '--override=input.glob.body.query.filtered.filter.bool.must[0].term.instrument___os=iOS'
      ];
      let result = uut(obj, minimist(command).override);

      result.should.have.deep.property('input.glob.body.query.filtered.filter.bool.must');

      let must = result
      .input.glob.body.query.filtered.filter.bool.must;

      must.should.have.length(1);
      must[0].term.should.have.property('instrument.os', 'iOS');
    });

    it('should use custom escaping', () => {
      let command = [
        'gulp search',
        '--override=input.glob.body.query.filtered.filter.bool.must[0].term.instrument_toDot_os=iOS'
      ];
      let result = uut(obj, minimist(command).override, '_toDot_');

      result.should.have.deep.property('input.glob.body.query.filtered.filter.bool.must');

      let must = result
      .input.glob.body.query.filtered.filter.bool.must;

      must.should.have.length(1);
      must[0].term.should.have.property('instrument.os', 'iOS');
    });
  });

  describe('default should be', function() {
    let objWithDefault;

    beforeEach(() => {
      objWithDefault = {
        input: {
          glob: {
            body: {
              query: {
                filtered: {
                  filter: {
                    bool: {
                      must: [{
                        term: {
                          additionalType: 'Company'
                        }
                      }]
                    }
                  }
                }
              }
            }
          }
        }
      };
    });

    it('preserved if array index is set higher', () => {
      let command = [
        'gulp search',
        '--override=input.glob.body.query.filtered.filter.bool.must[1].term.name=Google',
        '--override=input.glob.body.query.filtered.filter.bool.must[2].term.country=UK',
      ];
      let result = uut(objWithDefault, minimist(command).override);
      let must = result
      .input.glob.body.query.filtered.filter.bool.must;

      must.should.have.length(3);
      must[0].term.should.have.property('additionalType', 'Company');
      must[1].term.should.have.property('name', 'Google');
      must[2].term.should.have.property('country', 'UK');
    });

    it('overwritten if array index is set equal', () => {
      let command = [
        'gulp search',
        '--override=input.glob.body.query.filtered.filter.bool.must[0].term.additionalType=SearchCompany',
        '--override=input.glob.body.query.filtered.filter.bool.must[1].term.name=Google',
        '--override=input.glob.body.query.filtered.filter.bool.must[2].term.country=UK',
      ];
      let result = uut(obj, minimist(command).override);
      let must = result
      .input.glob.body.query.filtered.filter.bool.must;

      must.should.have.length(3);
      must[0].term.should.have.property('additionalType', 'SearchCompany');
      must[1].term.should.have.property('name', 'Google');
      must[2].term.should.have.property('country', 'UK');
    });

    it('numeric parameters should be converted', () => {
      let command = [
        'gulp search',
        '--override=input.glob.body.query.filtered.filter.bool.must[0].term.additionalType=SearchCompany',
        '--override=input.glob.body.query.filtered.filter.bool.must[1].term.name=Google',
        '--override=input.glob.body.query.filtered.filter.bool.must[2].term.country=UK',
        '--override=input.glob.body.aggs.plays.geohash_grid.precision=7'
      ];
      let result = uut(obj, minimist(command).override);
      let precision = result
      .input.glob.body.aggs.plays.geohash_grid.precision;

      precision.should.be.a('number');
      precision.should.equal(7);
    });
  });
});
