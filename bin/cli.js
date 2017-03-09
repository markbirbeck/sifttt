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
  Sink = require(sinkModulePath);
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
      console.error(`Can't load module '${sinkModulePath}'. Please ensure it is installed.`);
      process.exit(-1);
  } else {
    throw e;
  }
}

let pipelineIn = Pipeline.create({name: command})
.apply(Read.from(new Source(argv)));

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

let pipelineOut = pipelineTransform
.apply(new ct.ToVinyl())
.apply(Write.to(new Sink(argv)))
;

pipelineOut.run(() => {
  if (argv.verbose) {
    console.error(`Finished Processing: ${command}`);
  }
});
;
