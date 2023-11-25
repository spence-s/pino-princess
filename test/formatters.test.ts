import anyTest, {type TestFn} from 'ava';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import getFormatters from '../lib/utils/format';

dayjs.extend(utc);

const test = anyTest as TestFn<{
  stripAnsi: (str: string) => string;
}>;

test.before(async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');
  t.context.stripAnsi = stripAnsi;
});

const {
  formatLevel,
  formatLoadTime,
  formatDate,
  formatName,
  formatMessage,
  formatBundleSize,
  formatExtraFields,
  formatMethod,
  formatStack,
  formatUrl,
  formatStatusCode,
  formatErrorProp,
  formatId,
} = getFormatters();

test('formatLevel', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  /**
   * note: the space after some of the levels is intentional
   * as it is part of the formatLevel function, which pads the shorter strings
   */

  const info = stripAnsi(formatLevel('info'));
  t.is(info, '✨ INFO ');

  const warn = stripAnsi(formatLevel('warn'));
  t.is(warn, '⚠️  WARN ');

  const error = stripAnsi(formatLevel('error'));
  t.is(error, '🚨 ERROR');

  const fatal = stripAnsi(formatLevel('fatal'));
  t.is(fatal, '💀 FATAL');

  const userlvl = stripAnsi(formatLevel('userlvl'));
  t.is(userlvl, '👤 USERLVL');

  const debug = stripAnsi(formatLevel('debug'));
  t.is(debug, '🐛 DEBUG');
});

test('formatLoadTime', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const loadTime1 = stripAnsi(formatLoadTime('0.1') ?? '');
  t.is(loadTime1, '0ms');

  const loadTime2 = stripAnsi(formatLoadTime('100') ?? '');
  t.is(loadTime2, '100ms');

  const loadTime3 = stripAnsi(formatLoadTime(500) ?? '');
  t.is(loadTime3, '500ms');
});

test('formatDate', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');
  const ts = new Date('2020-01-01T00:00:00.000Z').getTime();

  const date1 = stripAnsi(formatDate(ts) ?? '');
  t.is(date1, `[${dayjs.utc(ts).format('H:mm:ss')}]`);
});

test('formatName', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const name1 = stripAnsi(formatName('name') ?? '');
  t.is(name1, 'name:');
});

test('formatMessage', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const messageInfo = stripAnsi(
    formatMessage({level: 'info', message: 'message'}) ?? '',
  );
  t.is(messageInfo, 'message');

  const messageWarn = stripAnsi(
    formatMessage({level: 'warn', message: 'message'}) ?? '',
  );
  t.is(messageWarn, 'message');

  const messageError = stripAnsi(
    formatMessage({level: 'error', message: 'message'}) ?? '',
  );
  t.is(messageError, 'message');

  const messageFatal = stripAnsi(
    formatMessage({level: 'fatal', message: 'message'}) ?? '',
  );
  t.is(messageFatal, 'message');

  const messageUserlvl = stripAnsi(
    formatMessage({level: 'userlvl', message: 'message'}) ?? '',
  );

  t.is(messageUserlvl, 'message');

  const messageDebug = stripAnsi(
    formatMessage({level: 'debug', message: 'message'}) ?? '',
  );
  t.is(messageDebug, 'message');
});

test('formatBundleSize', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const bundleSize = stripAnsi(formatBundleSize('1000') ?? '');
  t.is(bundleSize, '1000B');
});

test('formatExtraFields', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const extraFields = stripAnsi(
    formatExtraFields({
      extra: 'fields',
    }) ?? '',
  );
  t.is(extraFields, '\n  "extra": "fields"');
});

test('formatMethod', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const method = stripAnsi(formatMethod('method') ?? '');
  t.is(method, 'method');
});

test('formatStack', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const {stack} = new Error('test error');

  const stackFormatted = stripAnsi(formatStack('stack') ?? '');
  t.is(stackFormatted, '\n  stack');
});

test('formatUrl', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const url = stripAnsi(formatUrl('url') ?? '');
  t.is(url, '    url');
});

test('formatStatusCode', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const statusCode = stripAnsi(formatStatusCode(200) ?? '');
  t.is(statusCode, '200');
});

test('formatId', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');

  const statusCode = stripAnsi(formatId('12345') ?? '');
  t.is(statusCode, '[ID:12345]');
});

test('formatErrorProp > basic error', async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');
  const error = new Error('test error');

  const errorProp = stripAnsi(
    formatErrorProp({
      type: 'Error',
      message: 'test error',
      stack: error.stack,
    }) ?? '',
  );

  t.is(errorProp, `\n  ${error.stack ?? ''}\n`);
});
