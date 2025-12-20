/* eslint-disable @typescript-eslint/no-floating-promises */
import {test, before, type TestContext} from 'node:test';
import {format} from 'date-fns';
import {prettify} from '../lib/prettify.ts';

let stripAnsi: (str: string) => string;
let prettifyWrapper: (input: string | Record<string, unknown>) => string;
let prettifySingleLine: (input: string | Record<string, unknown>) => string;

before(async () => {
  const {default: stripAnsiModule} = await import('strip-ansi');
  stripAnsi = stripAnsiModule;
  prettifyWrapper = (input: string | Record<string, unknown>) =>
    stripAnsi(prettify()(input) ?? '').trim();
  prettifySingleLine = (input: string | Record<string, unknown>) =>
    stripAnsi(prettify({singleLine: true})(input) ?? '').trim();
});

test('creates basic log lines with level', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
  });

  const output = prettifyWrapper(input);

  t.assert.snapshot(output);
});

test('creates basic log lines with string level', (t: TestContext) => {
  const input = JSON.stringify({
    level: 'info',
    msg: 'hello',
  });

  const output = prettifyWrapper(input);

  t.assert.snapshot(output);
});

test('creates basic log lines with level, message, and time', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
  });

  const output = prettifyWrapper(input);

  t.assert.snapshot(output);
});

test('creates basic log lines with level, message, and time, and res.statusCode', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    res: {
      statusCode: 200,
    },
  });

  const output = prettifyWrapper(input);

  t.assert.snapshot(output);
});

test('creates basic log lines with level, message, and time, and req.method', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    req: {
      method: 'GET',
      id: '123',
    },
    res: {
      statusCode: 200,
    },
  });

  const output = prettifyWrapper(input);

  t.assert.snapshot(output);
});

test('full log line with all time and no extra time', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
    res: {
      statusCode: 200,
    },
    req: {
      method: 'GET',
      url: 'http://localhost:3000',
      id: '123',
    },
    name: 'test',
    ns: 'test',
    msg: 'hello',
    id: '123',
    responsedate: 100,
  });

  const output = prettifyWrapper(input);

  t.assert.snapshot(output);
});

test('full log line with all time and extra time', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
    res: {
      statusCode: 200,
    },
    req: {
      method: 'GET',
      url: 'http://localhost:3000',
      id: '123',
    },
    name: 'test',
    ns: 'test',
    msg: 'hello',
    responsedate: 100,
    extra: 'time',
  });

  const output = prettifyWrapper(input);

  t.assert.snapshot(output);
});

test('full log line with all time and extra time multiline', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
    res: {
      statusCode: 200,
      something: 'extra',
    },
    req: {
      method: 'GET',
      url: 'http://localhost:3000',
      id: '123',
      something: 'extra',
    },
    name: 'test',
    ns: 'test',
    msg: 'hello',
    responsedate: 100,
    extra: 'time',
    multi: 'line',
    idk: 'what',
    else: 'to add',
    for: {
      extra: 'time',
    },
  });

  const output = prettifyWrapper(input);

  t.assert.snapshot(output);
});

test('custom time format', (t: TestContext) => {
  const time = new Date();

  const input = JSON.stringify({
    level: 30,
    time,
    msg: 'hello',
  });

  const defaultOutput = prettifyWrapper(input);

  const output = stripAnsi(
    prettify({timeFormat: 'yyyy-MM-dd HH:mm:ss'})(input) ?? '',
  ).trim();

  const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');

  t.assert.ok(!defaultOutput.includes(formattedTime));
  t.assert.ok(output.includes(`[${formattedTime}]`));
});

test('custom message key', (t: TestContext) => {
  const inputDefault = JSON.stringify({
    level: 30,
    msg: 'hello',
  });

  const outputDefault = prettifyWrapper(inputDefault);

  const input = JSON.stringify({
    level: 30,
    message: 'hello',
  });

  const output = stripAnsi(
    prettify({messageKey: 'message'})(input) ?? '',
  ).trim();

  t.assert.strictEqual(outputDefault, output);
});

test('custom error key', (t: TestContext) => {
  const error = new Error('test error');
  const inputDefault = JSON.stringify({
    level: 50,
    err: error,
  });

  const outputDefault = prettifyWrapper(inputDefault);

  const input = JSON.stringify({
    level: 50,
    error,
  });

  const output = stripAnsi(prettify({errorKey: 'error'})(input) ?? '').trim();

  t.assert.strictEqual(outputDefault, output);
});

test('custom time key', (t: TestContext) => {
  const time = new Date();
  const inputDefault = JSON.stringify({
    level: 50,
    time,
  });

  const outputDefault = prettifyWrapper(inputDefault);

  const input = JSON.stringify({
    level: 50,
    timestamp: time,
  });

  const output = stripAnsi(
    prettify({timeKey: 'timestamp'})(input) ?? '',
  ).trim();

  t.assert.strictEqual(outputDefault, output);
});

test('custom formatters are merged in the same order as default', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
    msg: 'hello',
    name: 'test',
    req: {
      method: 'GET',
      id: '123',
    },
    res: {
      statusCode: 200,
    },
    customField: 'customValue',
  });

  const defaultOutput = prettifyWrapper(input);

  t.assert.snapshot(defaultOutput);

  const output = stripAnsi(
    prettify({
      format: {msg: (msg) => `!!!${msg}!!!`, name: (name) => `!!!${name}!!!`},
    })(input) ?? '',
  ).trim();

  t.assert.snapshot(output);

  t.assert.ok(output.startsWith('!!!test!!!'));
});

test('creates extra log as single line', (t: TestContext) => {
  const input = JSON.stringify({
    level: 30,
    msg: 'hello',
    extra: {
      a: 'b',
      c: 'd',
    },
  });

  const output = prettifySingleLine(input);
  const defaultOutput = prettifyWrapper(input);

  t.assert.snapshot(output);

  t.assert.ok(defaultOutput.includes('\n'));
  t.assert.ok(!output.includes('\n'));
});
