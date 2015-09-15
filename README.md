# sifttt

Create simple recipes to do simple tasks, using gulp.

## Adding Recipes

Recipes are created in a gulp file, like this:

```javascript
var gulp = require('gulp');
var sifttt = require('sifttt');

var recipe = { ... };

sifttt.addRecipe(gulp, recipe);
```

This will create a gulp task with the recipe's name, which can be used from the command-line like any other gulp task.

## Recipe Parameters

The parameters passed to the `addRecipe()` method are:

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

## An Example

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
```
