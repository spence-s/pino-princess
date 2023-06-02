import anyTest, {type TestFn} from 'ava';
import dayjs from 'dayjs';
import prettify from '../dist/lib/prettify';

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

test('creates basic log lines with level, message, and time', (t) => {
  const time = Date.now();
  const input = JSON.stringify({
    level: 30,
    message: 'hello',
    time,
  });

  const output = t.context.prettify(input);

  t.is(output, `🕰️ [${dayjs(time).format('HH:mm:ss')}] ✨ INFO  hello`);
});
