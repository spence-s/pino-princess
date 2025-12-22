/* eslint-disable @typescript-eslint/naming-convention */
import stripAnsi from 'strip-ansi';
import test from 'ava';
import {format} from 'date-fns';
import {execa} from 'execa';
import hasAnsi from 'has-ansi';
import {err} from 'pino-std-serializers';

const env = {FORCE_COLOR: 'true', TERM: 'vscode'};

test('cli --help runs without error', async (t) => {
  const {stdout} = await execa('node', ['cli.ts', '--help'], {
    env,
  });
  t.snapshot(stdout);
});

test('cli formats a log line', async (t) => {
  const {stdout} = await execa('node', ['cli.ts'], {
    env,
    input: JSON.stringify({
      level: 30,
      msg: 'hello',
      time: Date.now(),
    }),
  });
  t.true(hasAnsi(stdout));
});

test('cli respects --messageKey option', async (t) => {
  const time = Date.now();
  // Test with default messageKey
  const {stdout: stdoutWithDefaultMessageKey} = await execa(
    'node',
    ['cli.ts'],
    {
      env,
      input: JSON.stringify({
        level: 30,
        msg: 'hello',
        time,
      }),
    },
  );

  const {stdout} = await execa('node', ['cli.ts', '--messageKey=message'], {
    env,
    input: JSON.stringify({
      level: 30,
      message: 'hello',
      time,
    }),
  });

  t.is(stdoutWithDefaultMessageKey, stdout);
});

test('cli respects --errorKey option', async (t) => {
  const serializedError = err(new Error('test error'));
  const time = Date.now();

  const {stdout: stdoutWithDefaultErrorKey} = await execa('node', ['cli.ts'], {
    env,
    input: JSON.stringify({
      level: 50,
      err: serializedError,
      time,
    }),
  });

  const {stdout: stdOutWithErrorKeyOption} = await execa(
    'node',
    ['cli.ts', '--errorKey=error'],
    {
      env,
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

  const {stdout: stdOutWithDefaultTimeKey} = await execa('node', ['cli.ts'], {
    env,
    input: JSON.stringify({
      level: 30,
      time,
    }),
  });

  const {stdout: stdoutWithTimeKeyOption} = await execa(
    'node',
    ['cli.ts', '--timeKey=timestamp'],
    {
      env,
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
    ['cli.ts', '--timeFormat=yyyy-MM-dd HH:mm:ss'],
    {
      env,
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

  const {stdout: stdoutMultiline} = await execa('node', ['cli.ts'], {
    env,
    input,
  });

  const {stdout} = await execa('node', ['cli.ts', '--singleLine'], {
    env,
    input,
  });

  t.true(stdoutMultiline.includes('\n'));
  // Check if the output is a single line
  t.false(stdout.includes('\n'));
});

test('cli respects --colors option', async (t) => {
  const input = {
    level: 30,
  };
  const {stdout: stdoutStandard} = await execa('node', ['cli.ts'], {
    env,
    input: JSON.stringify(input),
  });
  const {stdout: stdoutWithColors} = await execa(
    'node',
    ['cli.ts', '--colors'],
    {
      env,
      input: JSON.stringify(input),
    },
  );
  const {stdout: stdoutWithoutColors} = await execa(
    'node',
    ['cli.ts', '--no-colors'],
    {
      env,
      input: JSON.stringify(input),
    },
  );
  t.true(hasAnsi(stdoutWithColors));
  t.false(hasAnsi(stdoutWithoutColors));
  t.is(stdoutStandard, stdoutWithColors);
  t.is(stripAnsi(stdoutWithColors), stdoutWithoutColors);
});
