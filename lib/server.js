module.exports = function(options) {
  var express = require('express');
  var cors = require('cors');
  var app = express();

  if (process.env.CORS_ENABLED) {
    var options = {
      origin: process.env.CORS_ORIGIN || false,
      credentials: process.env.CORS_CREDENTIALS || false
    };

    app.use(cors(options));
  }

  var server = app.listen(options.port, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at %s:%d', host, port);
  });
  return app;
}
