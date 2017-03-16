#!/usr/bin/env node
'use strict';
const path = require('path');
require('dotenv').config((process.env.DOT_ENV_FILE) ? {path: process.env.DOT_ENV_FILE} : undefined);

const Pipeline = require('sifttt/lib/beam/Pipeline');
const Read = require('sifttt/lib/beam/Read');
const Write = require('sifttt/lib/beam/Write');
const ct = require('sifttt/lib/beam/coreTransforms');

const yargs = require('yargs');

let argv = yargs
.usage('$0 command')
.version()
.env()
.config()
.global(['config'])
.commandDir(path.join(__dirname, '../lib/beamish/commands'))
.demand(1, 'must provide a valid command')
.help('h')
.alias('h', 'help')
.argv;

// console.error(argv);


const command = argv._[0];

let sourceModulePath;
let sinkModulePath;

if (command === 'source') {
  sourceModulePath = argv.modulePath;
} else {
  sourceModulePath = 'sifttt/lib/beam/StdinSource';
}

if (command === 'sink') {
  sinkModulePath = argv.modulePath;
} else {
  sinkModulePath = 'sifttt/lib/beam/StdoutSink';
}

let Source;
try {
  if (argv.verbose) {
    console.error('About to load source from:', sourceModulePath);
  }
  Source = require(sourceModulePath);
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
      console.error(`Can't load module '${sourceModulePath}'. Please ensure it is installed.`);
      process.exit(-1);
  } else {
    throw e;
  }
}

let Sink;
try {
  if (argv.verbose) {
    console.error('About to load sink from:', sinkModulePath);
  }
  Sink = require(sinkModulePath);
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
      console.error(`Can't load module '${sinkModulePath}'. Please ensure it is installed.`);
      process.exit(-1);
  } else {
    throw e;
  }
}

/**
 * Create an instance of our source, and if it's not a pipeline than wrap it
 * in a Read.from():
 */

let source = new Source(argv);

if (source.getStream) {
  source = Read.from(source);
}

let pipelineIn = Pipeline.create({name: command})
.apply(source);

let pipelineTransform = pipelineIn;

if (ct.hasOwnProperty(command)) {
  let Module;

  try {
    Module = require(argv.modulePath);
  } catch (e) {
    if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        console.error(`Can't load module '${argv.modulePath}'. Please ensure it is installed.`);
        process.exit(-1);
    } else {
      throw e;
    }
  }

  pipelineTransform = pipelineTransform
  .apply(new ct.ParseJSON())
  .apply(new ct[command](Module(argv)));
}

/**
 * Create an instance of our sink, and if it's not a pipeline than wrap it
 * in a Write.to():
 */

let sink = new Sink(argv);

if (sink.getStream) {
  sink = Write.to(sink);
}

let pipelineOut = pipelineTransform
.apply(new ct.ToVinyl())
.apply(sink)
;

pipelineOut.run(() => {
  if (argv.verbose) {
    console.error(`Finished Processing: ${command}`);
  }
});
;
