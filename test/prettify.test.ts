import anyTest, {type TestFn} from 'ava';
import {prettify} from '../lib/prettify';

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
  const time = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    time,
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and time', (t) => {
  const time = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    time,
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and time, and res.statusCode', (t) => {
  const time = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    time,
    res: {
      statusCode: 200,
    },
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and time, and req.method', (t) => {
  const time = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    time,
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

test('full log line with all data and no extra data', (t) => {
  const time = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    time,
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
    responseTime: 100,
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('full log line with all data and extra data', (t) => {
  const time = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    time,
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
    responseTime: 100,
    extra: 'data',
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('full log line with all data and extra data multiline', (t) => {
  const time = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    time,
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
    responseTime: 100,
    extra: 'data',
    multi: 'line',
    idk: 'what',
    else: 'to add',
    for: {
      extra: 'data',
    },
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

// export const WHITE_LIST = [
//   'res.statusCode',
//   'req.method',
//   'req.url',
//   'req.id',
//   'level',
//   'name',
//   'ns',
//   'msg',
//   'responseTime',
// ];

// export const BLACK_LIST = ['req', 'res'];
