const {default: test} = require('ava');
const chalk = require('chalk');
const dayjs = require('dayjs');
const prettify = require('../dist/lib/prettify').default({});

test('creates log lines with given data', (t) => {
  const time = Date.now();
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    time,
  });

  const output = prettify(input);

  t.is(
    output?.trim(),
    `${chalk.grey(dayjs(time).format('HH:mm:ss'))} ✨ ${chalk.cyan(
      'INFO',
    )}  ${chalk.white('hello')}`,
  );
});
