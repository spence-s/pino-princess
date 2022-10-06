const {default: test} = require('ava');
const chalk = require('chalk');
const dayjs = require('dayjs');
const prettify = require('../lib/prettify')({});

test('creates log lines with given data', (t) => {
  const time = Date.now();
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    time,
  });

  const output = prettify(input);

  t.log(output);

  t.is(
    output,
    `${dayjs(time).format('HH:mm:ss')} ✨ ${chalk.cyan('INFO')}  hello\n`,
  );
});
