const {isMainThread} = require('worker_threads');
const SonicBoom = require('sonic-boom');

function noop() {}

module.exports = buildSafeSonicBoom;

/**
 * Creates a safe SonicBoom instance
 *
 * @param {object} opts Options for SonicBoom
 *
 * @returns {object} A new SonicBoom stream
 */
function buildSafeSonicBoom(options) {
  const stream = new SonicBoom(options);
  stream.on('error', filterBrokenPipe);
  // If we are sync: false, we must flush on exit
  if (!options.sync && isMainThread) {
    setupOnExit(stream);
  }

  return stream;

  function filterBrokenPipe(error) {
    if (error.code === 'EPIPE') {
      stream.write = noop;
      stream.end = noop;
      stream.flushSync = noop;
      stream.destroy = noop;
      return;
    }

    stream.removeListener('error', filterBrokenPipe);
  }
}

function setupOnExit(stream) {
  /* istanbul ignore next */
  if (global.WeakRef && global.WeakMap && global.FinalizationRegistry) {
    // This is leak free, it does not leave event handlers
    const onExit = require('on-exit-leak-free');

    onExit.register(stream, autoEnd);

    stream.on('close', function () {
      onExit.unregister(stream);
    });
  }
}

function autoEnd(stream, eventName) {
  // This check is needed only on some platforms

  if (stream.destroyed) {
    return;
  }

  if (eventName === 'beforeExit') {
    // We still have an event loop, let's use it
    stream.flush();
    stream.on('drain', function () {
      stream.end();
    });
  } else {
    // We do not have an event loop, so flush synchronously
    stream.flushSync();
  }
}
