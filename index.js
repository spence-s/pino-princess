const pump = require('pump');
const {Transform} = require('readable-stream');
const abstractTransport = require('pino-abstract-transport');
const prettify = require('./lib/prettify');
const buildSafeSonicBoom = require('./lib/build-safe-sonic-boom');

function build(options = {}) {
  const pretty = prettify(options);
  return abstractTransport(
    function (source) {
      const stream = new Transform({
        objectMode: true,
        autoDestroy: true,
        transform(chunk, enc, cb) {
          const line = pretty(chunk);
          cb(null, line);
        },
      });

      let destination;

      if (
        typeof options.destination === 'object' &&
        typeof options.destination.write === 'function'
      ) {
        destination = options.destination;
      } else {
        destination = buildSafeSonicBoom({
          dest: options.destination || 1,
          append: options.append,
          mkdir: options.mkdir,
          sync: options.sync, // By default sonic will be async
        });
      }

      source.on('unknown', function (line) {
        destination.write(line + '\n');
      });

      pump(source, stream, destination);
      return stream;
    },
    {parse: 'lines'},
  );
}

module.exports = build;
module.exports.prettyFactory = prettify;
module.exports.default = build;
