'use strict';
const _ = require('lodash');
const h = require('highland');
const es = require('vinyl-elasticsearch');
const moment = require('moment');
const File = require('vinyl');

module.exports = {

  /**
   * Insert a shim before dest() in vinyl-elasticsearch, which
   * calculates the index to put the event in, the type and an id,
   * if they don't already exist:
   */

  dest: (glob, opts) => {
    return h.pipeline(stream => {
      return stream
	    .doto(file => {
	      if (!file.index) {
          if (file.data) {
            if (file.data.index) {
              file.index = file.data.index;
            } else {

              /**
               * [TODO] Make the field name configurable:
               */

              let timestamp = file.data.startTime;

              file.index = moment(timestamp).format(opts.indexOutput || opts.index ||
                '[logstash-]YYYY.MM.DD');
            }
          }
	      }
	    })
	    .doto(file => {
	      if (!file.id) {
	        if (file.data && file.data.id) {

	          /**
	           * [TODO] Make the field name configurable:
	           */

	          file.id = file.data.id;
	        }
	      }
	    })
	    .doto(file => {
	      if (!file.type) {
	        if (file.data && file.data.type) {

	          /**
	           * [TODO] Make the field name configurable:
	           */

	          file.type = file.data.type;
	        }
	      }
	    })
	    .through(es.dest(glob, opts))
	    ;
    });
  },

  /**
   * Process the search results into individual Vinyl files. This can probably
   * go into vinyl-elasticsearch, but we'd need to take some of the sifttt-specific
   * out first:
   */

  src: (glob, opts) => {
    let docinfoFields = opts.docinfo_fields || ['_index', '_type', '_id'];
    let docinfoTarget = opts.docinfo_target || '@metadata';

    return es.src(glob, opts)
    .flatMap(file => {

      /**
       * The search returns an array of results in hits.hits, so we'll
       * convert that to an array of Vinyl files...
       */

      let hits = file.data.hits.hits;
      let aggregations = file.data.aggregations;

      if (!hits.length && aggregations) {
        return h(push => {
          let file = new File({
            contents: new Buffer(JSON.stringify(aggregations))
          });
          file.data = aggregations;
          file.stat = {
            size: file.contents.length
          };
          push(null, file);
          push(null, h.nil);
        });
      }

      return h((push/*, next*/) => {
        hits.forEach(_data => {
          let data = _data._source;
          let metadata = _.pick(_data, docinfoFields);

          data[docinfoTarget] = metadata;
          let file = new File({
            path: metadata._id,
            contents: new Buffer(JSON.stringify(data))
          });

          file.data = data;
          file.stat = {
            size: file.contents.length
          };

          /**
           * This is not quite right; it should be set in the output
           * phase, and should come from fields defined by options.
           * To get that to work we'd need to add a final step that
           * uses the whole evaljson/params business:
           */

          file.id = metadata._id;
          file.index = metadata._index;
          file.type = metadata._type;

          push(null, file);
        });

        push(null, h.nil);
      });
    })
    ;
  }
};
