import {format} from 'date-fns';
import test from 'ava';
import hasAnsi from 'has-ansi';
import stripAnsi from 'strip-ansi';
import {prettify} from '../lib/prettify.ts';

test('creates basic log lines with level', (t) => {
  const input = JSON.stringify({
    level: 30,
  });
  const output = prettify()(input) ?? '';
  t.true(hasAnsi(output));
  t.snapshot(output);
});

test('creates basic log lines with string level', (t) => {
  const input = JSON.stringify({
    level: 'info',
    msg: 'hello',
  });
  const output = prettify()(input);
  t.snapshot(output);
});

test('creates basic log lines with level, message, and time', (t) => {
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
  });
  const output = prettify()(input);
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
  const output = prettify()(input);
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
  const output = prettify()(input);
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
  const output = prettify()(input);
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
  const output = prettify()(input);
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
  const output = prettify()(input);
  t.snapshot(output);
});

test('custom time format', (t) => {
  const time = new Date();
  const input = JSON.stringify({
    level: 30,
    time,
    msg: 'hello',
  });
  const defaultOutput = prettify()(input);
  const output = prettify({timeFormat: 'yyyy-MM-dd HH:mm:ss'})(input);
  const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');
  t.false(defaultOutput.includes(formattedTime));
  t.true(output.includes(`[${formattedTime}]`));
});

test('custom message key', (t) => {
  const inputDefault = JSON.stringify({
    level: 30,
    msg: 'hello',
  });
  const outputDefault = prettify()(inputDefault);
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
  });
  const output = prettify({messageKey: 'message'})(input);
  t.is(outputDefault, output);
});

test('custom error key', (t) => {
  const error = new Error('test error');
  const inputDefault = JSON.stringify({
    level: 50,
    err: error,
  });
  const outputDefault = prettify()(inputDefault);
  const input = JSON.stringify({
    level: 50,
    error,
  });
  const output = prettify({errorKey: 'error'})(input);
  t.is(outputDefault, output);
});

test('custom time key', (t) => {
  const time = new Date();
  const inputDefault = JSON.stringify({
    level: 50,
    time,
  });
  const outputDefault = prettify()(inputDefault);
  const input = JSON.stringify({
    level: 50,
    timestamp: time,
  });
  const output = prettify({timeKey: 'timestamp'})(input);
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
  const defaultOutput = prettify()(input);
  t.snapshot(defaultOutput);
  const output = prettify({
    format: {msg: (msg) => `!!!${msg}!!!`, name: (name) => `!!!${name}!!!`},
  })(input);
  t.snapshot(output);
  t.true(output.startsWith('!!!test!!!'));
});

test('creates extra log as single line', (t) => {
  const input = JSON.stringify({
    level: 30,
    msg: 'hello',
    extra: {
      a: 'b',
      c: 'd',
    },
  });
  const output = prettify({singleLine: true})(input);
  const defaultOutput = prettify()(input);
  t.snapshot(output);
  t.true(defaultOutput.trim().includes('\n'));
  t.false(output.trim().includes('\n'));
});
