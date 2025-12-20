/* eslint-disable @typescript-eslint/no-floating-promises */
import {test, before} from 'node:test';
import assert from 'node:assert';
import {Formatter} from '../lib/formatters.ts';

let stripAnsi: (str: string) => string;

before(async () => {
  const {default: stripAnsiModule} = await import('strip-ansi');
  stripAnsi = stripAnsiModule;
});

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

test('formatLevel', () => {
  /**
   * note: the space after some of the levels is intentional
   * as it is part of the formatLevel function, which pads the shorter strings
   */

  const info = stripAnsi(formatLevel(30));
  assert.strictEqual(info, '✨ INFO ');

  const warn = stripAnsi(formatLevel(40));
  assert.strictEqual(warn, '⚠️  WARN ');

  const error = stripAnsi(formatLevel(50));
  assert.strictEqual(error, '🚨 ERROR');

  const fatal = stripAnsi(formatLevel(60));
  assert.strictEqual(fatal, '💀 FATAL');

  // const userlvl = stripAnsi(formatLevel(0));
  // assert.strictEqual(userlvl, '👤 USERLVL');

  const debug = stripAnsi(formatLevel(20));
  assert.strictEqual(debug, '🐛 DEBUG');
});

test('formatLoadTime', () => {
  const loadTime1 = stripAnsi(formatLoadTime('0.1') ?? '');
  assert.strictEqual(loadTime1, '0ms');

  const loadTime2 = stripAnsi(formatLoadTime('100') ?? '');
  assert.strictEqual(loadTime2, '100ms');

  const loadTime3 = stripAnsi(formatLoadTime(500) ?? '');
  assert.strictEqual(loadTime3, '500ms');
});

test('formatName', () => {
  const name1 = stripAnsi(formatName('name') ?? '');
  assert.strictEqual(name1, '[name]');
});

test('formatMessage', () => {
  const messageInfo = stripAnsi(formatMessage('message', {level: 30}) ?? '');
  assert.strictEqual(messageInfo, 'message');

  const messageWarn = stripAnsi(formatMessage('message', {level: 40}) ?? '');
  assert.strictEqual(messageWarn, 'message');

  const messageError = stripAnsi(formatMessage('message', {level: 50}) ?? '');
  assert.strictEqual(messageError, 'message');

  const messageFatal = stripAnsi(formatMessage('message', {level: 60}) ?? '');
  assert.strictEqual(messageFatal, 'message');

  const messageUserlvl = stripAnsi(formatMessage('message', {level: 30}) ?? '');

  assert.strictEqual(messageUserlvl, 'message');

  const messageDebug = stripAnsi(formatMessage('message', {level: 20}) ?? '');
  assert.strictEqual(messageDebug, 'message');
});

test('formatExtraFields', () => {
  const extraFields = stripAnsi(
    formatExtraFields({
      extra: 'fields',
    }) ?? '',
  );
  assert.strictEqual(extraFields, '\n  "extra": "fields"');
});

test('formatMethod', () => {
  const method = stripAnsi(formatMethod('method') ?? '');
  assert.strictEqual(method, 'METHOD');
});

test('formatStack', () => {
  const stackFormatted = stripAnsi(formatStack('stack') ?? '');
  assert.strictEqual(stackFormatted, '\n  stack');
});

test('formatUrl', () => {
  const url = stripAnsi(formatUrl('url') ?? '');
  assert.strictEqual(url, '    url');

  // with status code
  const urlWithStatusCode = stripAnsi(
    formatUrl('url', {res: {statusCode: 200}}) ?? '',
  );

  assert.strictEqual(urlWithStatusCode, 'url');
});

test('formatStatusCode', () => {
  const statusCode = stripAnsi(formatStatusCode(200) ?? '');
  assert.strictEqual(statusCode, '200');
});

test('formatId', () => {
  const statusCode = stripAnsi(formatId('12345') ?? '');
  assert.strictEqual(statusCode, '[ID:12345]');
});

test('formatErrorProp > basic error', () => {
  const error = new Error('test error');

  const errorProp = stripAnsi(
    formatErrorProp({
      type: 'Error',
      message: 'test error',
      stack: error.stack,
    }) ?? '',
  );

  assert.strictEqual(errorProp, `\n  ${error.stack ?? ''}\n`);
});
