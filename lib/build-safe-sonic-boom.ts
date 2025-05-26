import {isMainThread} from 'node:worker_threads';
import __SonicBoom, {
  type SonicBoom as SonicBoomType,
  type SonicBoomOpts,
} from 'sonic-boom';
import * as onExit from 'on-exit-leak-free';

// eslint-disable-next-line @typescript-eslint/naming-convention
const SonicBoom = __SonicBoom as unknown as typeof SonicBoomType;

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export default buildSafeSonicBoom;

/**
 * Creates a safe SonicBoom instance
 */
function buildSafeSonicBoom(options: SonicBoomOpts) {
  const stream = new SonicBoom(options);
  stream.on('error', filterBrokenPipe);
  // If we are sync: false, we must flush on exit
  if (!options.sync && isMainThread) {
    setupOnExit(stream);
  }

  return stream;

  function filterBrokenPipe(error: Error & {code?: string}) {
    if (error.code === 'EPIPE') {
      // stream.write = noop;
      stream.end = noop;
      stream.flushSync = noop;
      stream.destroy = noop;
      return;
    }

    stream.removeListener('error', filterBrokenPipe);
  }
}

function setupOnExit(stream: SonicBoomType) {
  /* istanbul ignore next */
  if (
    globalThis.WeakRef &&
    globalThis.WeakMap &&
    globalThis.FinalizationRegistry
  ) {
    // This is leak free, it does not leave event handlers
    onExit.register(stream, autoEnd);

    stream.on('close', function () {
      onExit.unregister(stream);
    });
  }
}

function autoEnd(
  stream: SonicBoomType & {destroyed?: boolean},
  eventName: string,
): void {
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
