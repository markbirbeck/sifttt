# sifttt

Create simple recipes to do simple tasks, using gulp.

[![wercker status](https://app.wercker.com/status/b2afe59d6098b006d563f82f2b42fd78/s/master "wercker status")](https://app.wercker.com/project/bykey/b2afe59d6098b006d563f82f2b42fd78) [![Dependency Status](https://david-dm.org/markbirbeck/sifttt.svg)](https://david-dm.org/markbirbeck/sifttt)

## Adding Recipes

Recipes are created in a gulp file, like this:

```javascript
var gulp = require('gulp');
var sifttt = require('sifttt');

var connections = { ... };
var recipe = { ... };

sifttt.addRecipe(gulp, recipe, connections);
```

This will create a gulp task with the recipe's name, which can be used from the command-line like any other gulp task. The `connections` parameter is optional and provides options for channels that are used in the recipe.

## Recipe Parameters

The properties passed in the `recipe` parameter to the `addRecipe()` method are:

### name

The name of the recipe. This will become the gulp task name.

### if

The parameters for the `if` part of the recipe. These values indicate which channel will be used, and provide its parameters. (See below for more details.)

### then

The parameters for the `then` part of the recipe. These values indicate which channel will be used, and provide its parameters. (See below for more details.)

### map

A function to map the parameters so that the output of the `if` side is in the right format for the input to the `then` side.

## Channel Parameters

A recipe comprises two channels, the `if` and `then` channels. Their values are set as follows:

### channel

The name of the channel to use.

### glob

The `glob` parameters to provide to the channel's `src()` or `dest()` method (depending on whether the channel is being used for the `if` or `then` stage). The actual parameters will be channel-specific.

### opt

The `opt` parameters to provide to the channel's `src()` or `dest()` method (depending on whether the channel is being used for the `if` or `then` stage). The actual parameters will be channel-specific.

These values will override any values passed in via the `connections` parameter.

### arrayExpand

A boolean to indicate whether an array of data within a file should be converted to a collection of individual Vinyl files.

Note that this option is currently only implemented on the `_if` side.

## Connection Parameters

The properties passed in the `connection` parameter to the `addRecipe()` method are merged with the `opts` property in a recipe for the corresponding channel. See the connections example below to make this clearer.

## Examples

### A Complete Recipe

The following recipe reads a Google Sheets spreadsheet using the `google-sheets` channel, and then puts the resulting JSON into an ElasticSearch server, using the `elasticsearch` channel:

```javascript
var recipe = {
  name: 'sheetsToEs',
  if: {
    channel: 'google-sheets',
    glob: process.env.SPREADSHEET_KEYS.split(','),
    opts: {
      clientEmail: process.env.SPREADSHEET_CLIENT_EMAIL,
      privateKey: process.env.SPREADSHEET_PRIVATE_KEY
    }
  },
  then: {
    channel: 'elasticsearch',
    glob: {index: process.env.ELASTICSEARCH_INDEX},
    opts: {
      host: process.env.ELASTICSEARCH_HOST,
      requestTimeout: process.env.ELASTICSEARCH_REQUEST_TIMEOUT,
      rateLimit: process.env.ELASTICSEARCH_RATE_LIMIT
    }
  },
  map: function(file) {
    var data = file.data;
    var url =
      (data.location || data.organization || '') +
      '/' +
      data.type + '/' +
      ((data.startDate) ? (data.startDate.replace(/-/g, '/') + '/') : '') +
      (data.legalName || data.name)
        .toLowerCase()
        .replace(/ /g, '-');

    file.path = data.url = url;
    return file;
  }
};

sifttt.addRecipe(gulp, recipe);
```

## A Recipe With Connections

If a set of default connections are defined for one or more channels then these can be shared across recipes. The example above could be modified as follows:

```javascript
var connections = {
  'google-sheets': {
    clientEmail: process.env.SPREADSHEET_CLIENT_EMAIL,
    privateKey: process.env.SPREADSHEET_PRIVATE_KEY
  },
  'elasticsearch': {
    host: process.env.ELASTICSEARCH_HOST
  }
};

var recipe = {
  name: 'sheetsToEs',
  if: {
    channel: 'google-sheets',
    glob: process.env.SPREADSHEET_KEYS.split(',')
  },
  then: {
    channel: 'elasticsearch',
    glob: {index: process.env.ELASTICSEARCH_INDEX},
    opts: {
      requestTimeout: process.env.ELASTICSEARCH_REQUEST_TIMEOUT,
      rateLimit: process.env.ELASTICSEARCH_RATE_LIMIT
    }
  },
  map: function(file) { ... }
};

sifttt.addRecipe(gulp, recipe, connections);
```

and now additional recipes could be added that make use of the same connections:

```javascript
var recipe2 = {
  name: 'moreSheetsToEs',
  if: {
    channel: 'google-sheets',
    glob: ['sheet1', 'sheet2']
  },
  then: {
    channel: 'elasticsearch',
    glob: {index: process.env.ELASTICSEARCH_INDEX}
  },
  map: function(file) { /* maybe some different mappings */ }
};

sifttt.addRecipe(gulp, recipe2, connections);
```

## The Future is Beamish

It has been quite difficult to add new features relating to the chaining and nesting of pipelines, mainly due to the way Sifttt has modeled itself on the `logstah` approach.

There are also a number of other features that I wanted to add -- such as being able to process different parts of a recipe on different servers -- which would required creating full featured 'wrappers' around each possible processing step.

For this reason I started looking around for a suitable terminology to adopt for what I was trying to create and found the closest was the one provided by Apache Beam.

A simple pipeline in Beam looks like this (in Java):

```java
  public static void main(String[] args) {
    // Create a pipeline parameterized by commandline flags.
    Pipeline p = Pipeline.create(PipelineOptionsFactory.fromArgs(arg));

    p.apply(TextIO.Read.from("gs://..."))   // Read input.
     .apply(new CountWords())               // Do some processing.
     .apply(TextIO.Write.to("gs://..."));   // Write output.

    // Run the pipeline.
    p.run();
  }
```

(Example taken from [Cloud Dataflow > Pipelines](https://cloud.google.com/dataflow/model/pipelines).)

Sifttt version 0.83.0 onwards provides this as:

```javascript
const Pipeline = require('sifttt/lib/beam/Pipeline');
const GulpSource = require('sifttt/lib/beam/GulpSource');
const ElasticSearchSink = require('sifttt/lib/beam/ElasticSearchSink');

// Create a pipeline. The only parameter so far is 'name'.
let p = Pipeline.create({name: 'My Pipeline'});

p
.apply(Read.from(new GulpSource(path.join(__dirname, '..', 'fixtures',
  'file.json'))))             // Read input.
.apply(new CountWords())      // Do some processing.
.apply(Write.to(              // Write output.
  new ElasticSearchSink()
  .host(opts.host)
  .retries(opts.retries)
))
;

// Run the pipeline.
p.run();
```

At the moment I'm not intending to provide a faithful copy of Beam in Node; I was more seeking a set of concepts and terminology to express some of the ideas I've been working with around tasks, pipelines, streams, distributed processing, queues, windowing, data sources and targets, and so on. So far Apache Beam has approached these concepts in the best way I've seen, so I'm planning to adopt as much as possible of their approach.
