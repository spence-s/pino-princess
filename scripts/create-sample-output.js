import {prettify as createPrettify} from '../dist/index.js';

const _prettify = createPrettify();
const prettify = (obj) => _prettify(obj)?.replace(/\n$/, '');

const createBasicMessage = (level) =>
  prettify({
    level,
    msg: 'Just the most basic message',
  });

console.log(createBasicMessage(10));
console.log(createBasicMessage(20));
console.log(createBasicMessage(30));
console.log(createBasicMessage(40));
console.log(createBasicMessage(50));
console.log(createBasicMessage(60));

console.log();

console.log(
  'unformatted output and non-pino output from your app still gets printed, you do not lose ability to console.log anytime you want still!',
);

console.log();

console.log(
  prettify({
    level: 30,
    msg: 'Log lines improve as data is added to the pino log object! Checkout this logger ns field.',
  }),
);

console.log(
  prettify({
    level: 30,
    msg: 'This logger has a name! Check it out!',
    name: 'NAME',
  }),
);

console.log();

// eslint-disable-next-line max-params
const createLogLine = (level, ns, extra, msg, status = true) =>
  prettify({
    level,
    name: 'HTTP',
    msg: msg ?? `This is a ${ns} message`,
    req: {
      method: 'POST',
      url: `/api/${ns}`,
      id: 1,
    },
    res: {
      statusCode: status
        ? {
            trace: 200,
            info: 204,
            debug: 200,
            warn: 404,
            error: 400,
            fatal: 500,
          }[ns]
        : 0,
    },
    responseTime: Math.random() * 1000,
    ...extra,
  });

console.log(
  prettify({
    level: 40,
    msg: 'The next few logs will show some http logging! Let\'s give the logger the name "HTTP"',
  }),
);

console.log(createLogLine(10, 'trace'));
console.log(createLogLine(20, 'debug'));
console.log(createLogLine(30, 'info'));
console.log(
  createLogLine(
    30,
    'info',
    null,
    'This is a info message with an unknown status code',
    false,
  ),
);
console.log(createLogLine(40, 'warn'));
console.log(createLogLine(50, 'error'));
console.log(createLogLine(60, 'fatal'));

console.log();

console.log(
  prettify({
    level: 20,
    msg: 'How does my extra data get displayed?',
    any: 'extra data get displayed by',
    default: 'in a beautifully formatted, compact object',
    just: 'below the log line'.split(' '),
    nested: {
      data: {
        is: 'totally fine',
      },
      blacklisted: 'and whitelisted fields work for nested data too!',
    },
  }),
);

console.log();

console.log(
  prettify({
    level: 50,
    err: {
      type: 'Error',
      message: 'example error',
      stack: new Error('example error').stack,
      extra: 'fields on an error',
      nicely: 'displayed by default',
      right: 'below the error stack!',
    },
  }),
);

console.log();

const aggErr1 = new Error('aggy errors are easy');
const aggErr2 = new Error('throw em all the time!');
console.log(
  prettify({
    level: 60,
    msg: 'What about aggregate errors??',
    err: {
      message: 'the primary aggregate error',
      aggregateErrors: [
        {
          message: aggErr1.message,
          stack: aggErr1.stack,
          extra: 'data',
          gets: "added just like you'd expect!!",
          errors: 'from anywhere look great',
        },
        {
          message: aggErr2.message,
          stack: aggErr2.stack,
          extra: 'data',
          gets: "added just like you'd expect!!",
          errors: 'from anywhere look great',
        },
      ],
    },
  }),
);
