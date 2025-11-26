/* eslint-disable ava/no-ignored-test-files */
import test from 'ava';
import {format} from 'date-fns';
import {fi} from 'date-fns/locale';
import {execa} from 'execa';
import {err} from 'pino-std-serializers';

test('cli --help runs without error', async (t) => {
  const {stdout} = await execa('node', ['dist/cli.js', '--help']);
  t.snapshot(stdout);
});

test('cli formats a log line', async (t) => {
  const {stdout} = await execa('node', ['dist/cli.js'], {
    input: JSON.stringify({
      level: 30,
      msg: 'hello',
      time: Date.now(),
    }),
  });
  t.true(stdout.includes('INFO  hello'));
});

test('cli respects --messageKey option', async (t) => {
  const time = Date.now();
  // Test with default messageKey
  const {stdout: stdoutWithDefaultMessageKey} = await execa(
    'node',
    ['dist/cli.js'],
    {
      input: JSON.stringify({
        level: 30,
        msg: 'hello',
        time,
      }),
    },
  );

  const {stdout} = await execa(
    'node',
    ['dist/cli.js', '--messageKey=message'],
    {
      input: JSON.stringify({
        level: 30,
        message: 'hello',
        time,
      }),
    },
  );

  t.true(stdoutWithDefaultMessageKey.includes('INFO  hello'));
  t.true(stdout.includes('INFO  hello'));
  t.is(stdoutWithDefaultMessageKey, stdout);
});

test('cli respects --errorKey option', async (t) => {
  const serializedError = err(new Error('test error'));
  const time = Date.now();

  const {stdout: stdoutWithDefaultErrorKey} = await execa(
    'node',
    ['dist/cli.js'],
    {
      input: JSON.stringify({
        level: 50,
        err: serializedError,
        time,
      }),
    },
  );

  const {stdout: stdOutWithErrorKeyOption} = await execa(
    'node',
    ['dist/cli.js', '--errorKey=error'],
    {
      input: JSON.stringify({
        level: 50,
        error: serializedError,
        time,
      }),
    },
  );
  t.is(stdoutWithDefaultErrorKey, stdOutWithErrorKeyOption);
});

test('cli respects --timeKey option', async (t) => {
  const time = Date.now();

  const {stdout: stdOutWithDefaultTimeKey} = await execa(
    'node',
    ['dist/cli.js'],
    {
      input: JSON.stringify({
        level: 30,
        time,
      }),
    },
  );

  const {stdout: stdoutWithTimeKeyOption} = await execa(
    'node',
    ['dist/cli.js', '--timeKey=timestamp'],
    {
      input: JSON.stringify({
        level: 30,
        timestamp: time,
      }),
    },
  );
  t.is(stdoutWithTimeKeyOption, stdOutWithDefaultTimeKey);
});

// test cli timeformat option
test('cli respects --timeFormat option', async (t) => {
  const time = Date.now();
  const {stdout} = await execa(
    'node',
    ['dist/cli.js', '--timeFormat=yyyy-MM-dd HH:mm:ss'],
    {
      input: JSON.stringify({
        level: 30,
        msg: 'hello',
        time,
      }),
    },
  );

  // Check if the output contains the formatted time
  t.true(stdout.includes(format(time, 'yyyy-MM-dd HH:mm:ss')));
});

// test cli singleLine option
test('cli respects --singleLine option', async (t) => {
  const input = JSON.stringify({
    level: 30,
    msg: 'hello',
    time: Date.now(),
    extra: {
      field1: 'value1',
      field2: 'value2',
      field3: 'value3',
      field4: 'value4',
      field5: 'value5',
    },
  });

  const {stdout: stdoutMultiline} = await execa('node', ['dist/cli.js'], {
    input,
  });

  const {stdout} = await execa('node', ['dist/cli.js', '--singleLine'], {
    input,
  });

  t.true(stdoutMultiline.includes('\n'));
  // Check if the output is a single line
  t.false(stdout.includes('\n'));
});
