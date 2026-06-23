import test, {type TestFn} from 'ava';
import stripAnsi from 'strip-ansi';
import {Formatter} from '../lib/formatters.ts';

const {
  formatLevel,
  formatLoadTime,
  formatName,
  formatMessage,
  formatExtraFields,
  formatMethod,
  formatStack,
  formatUrl,
  formatStatusCode,
  formatErrorProp,
  formatId,
} = new Formatter({
  keyMap: {},
  supportsColor: true,
  supportsUnicode: true,
});

test('formatLevel', (t) => {
  /**
   * note: the space after some of the levels is intentional
   * as it is part of the formatLevel function, which pads the shorter strings
   */

  const info = stripAnsi(formatLevel(30));
  t.is(info, '✨ INFO ');

  const warn = stripAnsi(formatLevel(40));
  t.is(warn, '⚠️ WARN ');

  const error = stripAnsi(formatLevel(50));
  t.is(error, '🚨 ERROR');

  const fatal = stripAnsi(formatLevel(60));
  t.is(fatal, '💀 FATAL');

  // const userlvl = stripAnsi(formatLevel(0));
  // t.is(userlvl, '👤 USERLVL');

  const debug = stripAnsi(formatLevel(20));
  t.is(debug, '🐛 DEBUG');
});

test('formatLoadTime', (t) => {
  const loadTime1 = stripAnsi(formatLoadTime('0.1') ?? '');
  t.is(loadTime1, '0ms');

  const loadTime2 = stripAnsi(formatLoadTime('100') ?? '');
  t.is(loadTime2, '100ms');

  const loadTime3 = stripAnsi(formatLoadTime(500) ?? '');
  t.is(loadTime3, '500ms');
});

test('formatName', (t) => {
  const name1 = stripAnsi(formatName('name') ?? '');
  t.is(name1, '[name]');
});

test('formatMessage', (t) => {
  const messageInfo = stripAnsi(formatMessage('message', {level: 30}) ?? '');
  t.is(messageInfo, 'message');

  const messageWarn = stripAnsi(formatMessage('message', {level: 40}) ?? '');
  t.is(messageWarn, 'message');

  const messageError = stripAnsi(formatMessage('message', {level: 50}) ?? '');
  t.is(messageError, 'message');

  const messageFatal = stripAnsi(formatMessage('message', {level: 60}) ?? '');
  t.is(messageFatal, 'message');

  const messageUserlvl = stripAnsi(formatMessage('message', {level: 30}) ?? '');

  t.is(messageUserlvl, 'message');

  const messageDebug = stripAnsi(formatMessage('message', {level: 20}) ?? '');
  t.is(messageDebug, 'message');
});

test('formatExtraFields', (t) => {
  const extraFields = stripAnsi(
    formatExtraFields({
      extra: 'fields',
    }) ?? '',
  );
  t.is(extraFields, '\n  "extra": "fields"');
});

test('formatMethod', (t) => {
  const method = stripAnsi(formatMethod('method') ?? '');
  t.is(method, 'METHOD');
});

test('formatStack', (t) => {
  const stackFormatted = stripAnsi(formatStack('stack') ?? '');
  t.is(stackFormatted, '\n  stack');
});

test('formatUrl', (t) => {
  const url = stripAnsi(formatUrl('url') ?? '');
  t.is(url, '    url');

  // with status code
  const urlWithStatusCode = stripAnsi(
    formatUrl('url', {res: {statusCode: 200}}) ?? '',
  );

  t.is(urlWithStatusCode, 'url');
});

test('formatStatusCode', (t) => {
  const statusCode = stripAnsi(formatStatusCode(200) ?? '');
  t.is(statusCode, '200');
});

test('formatId', (t) => {
  const statusCode = stripAnsi(formatId('12345') ?? '');
  t.is(statusCode, '[ID:12345]');
});

test('formatErrorProp > basic error', (t) => {
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
