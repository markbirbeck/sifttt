'use strict';

const h = require('highland');

class Map {
  constructor(fn) {
    this._fn = fn;
  }

  apply() {
    return h.map(this._fn);
  }
};

class DoTo extends Map {
  constructor(fn) {
    super(
      x => {
        fn(x);
        return x;
      }
    );
  }
};

class Collect {
  apply() {
    return h.collect();
  }
};

class Drop {
  constructor(count) {
    this._count = count;
  }

  apply() {
    return h.drop(this._count || 0);
  }
};

class Filter {
  constructor(fn) {
    this._fn = fn;
  }

  apply() {
    return h.filter(this._fn);
  }
};

class Split {
  apply() {
    return h.split();
  }
};

class ParseJSON extends Map {
  constructor() {
    super(
      file => {

        /**
         * If there is no data then convert 'contents' to JSON:
         */

        if (!file.data) {
          try {
            file.data = JSON.parse(String(file.contents));
          } catch (e) {

          }
        }
        return file;
      }
    );
  }
};

class FromVinyl extends Map {
  constructor() {
    super(file => file.contents);
  }
};

exports.Map = Map;
exports.DoTo = DoTo;
exports.Drop = Drop;
exports.Filter = Filter;
exports.FromVinyl = FromVinyl;
exports.Split = Split;
exports.Collect = Collect;
exports.ParseJSON = ParseJSON;
