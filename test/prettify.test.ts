import anyTest, {type TestFn} from 'ava';
import {prettify} from '../lib/prettify.js';

const test = anyTest as TestFn<{
  stripAnsi: (str: string) => string;
  /**
   * A little wrapper around prettify to strip ansi codes as there is no need to test them
   */
  prettify: (input: string | Record<string, unknown>) => string;
}>;

test.before(async (t) => {
  const {default: stripAnsi} = await import('strip-ansi');
  t.context.stripAnsi = stripAnsi;
  t.context.prettify = (input: string | Record<string, unknown>) =>
    stripAnsi(prettify()(input) ?? '').trim();
});

test('creates basic log lines with level', (t) => {
  const input = JSON.stringify({
    level: 30,
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with string level', (t) => {
  const input = JSON.stringify({
    level: 'info',
    msg: 'hello',
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and time', (t) => {
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and time, and res.statusCode', (t) => {
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    res: {
      statusCode: 200,
    },
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and time, and req.method', (t) => {
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

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('full log line with all time and no extra time', (t) => {
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

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('full log line with all time and extra time', (t) => {
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

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('full log line with all time and extra time multiline', (t) => {
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

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('custom time format', (t) => {
  const input = JSON.stringify({
    level: 30,
    time: 1_748_381_511_840,
    msg: 'hello',
  });

  const output = t.context
    .stripAnsi(prettify({timeFormat: 'yyyy-MM-dd HH:mm:ss'})(input) ?? '')
    .trim();

  t.snapshot(output);
});

test('custom message key', (t) => {
  const inputDefault = JSON.stringify({
    level: 30,
    msg: 'hello',
  });

  const outputDefault = t.context.prettify(inputDefault);

  const input = JSON.stringify({
    level: 30,
    message: 'hello',
  });

  const output = t.context
    .stripAnsi(prettify({messageKey: 'message'})(input) ?? '')
    .trim();

  t.is(outputDefault, output);
});

test('custom error key', (t) => {
  const error = new Error('test error');
  const inputDefault = JSON.stringify({
    level: 50,
    err: error,
  });

  const outputDefault = t.context.prettify(inputDefault);

  const input = JSON.stringify({
    level: 50,
    error,
  });

  const output = t.context
    .stripAnsi(prettify({errorKey: 'error'})(input) ?? '')
    .trim();

  t.is(outputDefault, output);
});

test('custom formatters are merged in the same order as default', (t) => {
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

  const defaultOutput = t.context.prettify(input);

  t.snapshot(defaultOutput);

  const output = t.context
    .stripAnsi(
      prettify({
        format: {msg: (msg) => `!!!${msg}!!!`, name: (name) => `!!!${name}!!!`},
      })(input) ?? '',
    )
    .trim();

  t.snapshot(output);

  t.true(output.startsWith('!!!test!!!'));
});
