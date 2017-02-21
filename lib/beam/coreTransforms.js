'use strict';

const h = require('highland');
const File = require('vinyl');
const toVinyl = require('../toVinyl');

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

class Otherwise {
  constructor(ys) {
    this._ys = ys;
  }


  apply() {
    return h.otherwise(this._ys);
  }
};

class Split {
  apply() {
    return h.split();
  }
};

class ParseJSON extends Map {
  constructor() {
    super(element => JSON.parse(element));
  }
};

class FromVinyl extends Map {
  constructor() {
    super(file => file.data || String(file.contents) || file);
  }
};

class ToVinyl extends Map {
  constructor() {
    super(file => {
      return (File.isVinyl(file)) ? file : toVinyl(file);
    });
  }
};

exports.Map = Map;
exports.DoTo = DoTo;
exports.Drop = Drop;
exports.Filter = Filter;
exports.FromVinyl = FromVinyl;
exports.Split = Split;
exports.ToVinyl = ToVinyl;
exports.Collect = Collect;
exports.Otherwise = Otherwise;
exports.ParseJSON = ParseJSON;
