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

exports.Map = Map;
exports.DoTo = DoTo;
exports.Collect = Collect;
