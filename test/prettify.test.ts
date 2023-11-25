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
  const date = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    date,
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and date', (t) => {
  const date = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    date,
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and date, and res.statusCode', (t) => {
  const date = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    date,
    res: {
      statusCode: 200,
    },
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('creates basic log lines with level, message, and date, and req.method', (t) => {
  const date = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    date,
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

test('full log line with all date and no extra date', (t) => {
  const date = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    date,
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

test('full log line with all date and extra date', (t) => {
  const date = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    date,
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
    extra: 'date',
  });

  const output = t.context.prettify(input);

  t.snapshot(output);
});

test('full log line with all date and extra date multiline', (t) => {
  const date = new Date('2020-01-01T00:00:00.000Z');
  const input = JSON.stringify({
    level: 30,
    date,
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
    extra: 'date',
    multi: 'line',
    idk: 'what',
    else: 'to add',
    for: {
      extra: 'date',
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
//   'responsedate',
// ];

// export const BLACK_LIST = ['req', 'res'];
