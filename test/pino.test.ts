import {Writable} from 'node:stream';
import test, {type ExecutionContext} from 'ava';
import {pino} from 'pino';
import {err as serializeError} from 'pino-std-serializers';
import build from '../index.ts';

const time = new Date('2025-01-01T00:00:00Z');

const createDestination = (t: ExecutionContext) =>
  new Writable({
    write(chunk, _enc, cb) {
      const out = String(chunk);
      t.snapshot(out);
      cb();
    },
  });

test('acts as a pino transport stream and formats a basic info message', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time}, 'hello');
});

test('respects messageKey option', (t) => {
  const transport = build({
    destination: createDestination(t),
    messageKey: 'message',
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time, message: 'custom message key'});
});

test('respects errorKey option', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  const error = new Error('Test error');
  logger.error({time, error: serializeError(error)}, 'An error occurred');
});

test('respects timeKey option', (t) => {
  const transport = build({
    destination: createDestination(t),
    timeKey: 'timestamp',
    colors: true,
    unicode: true,
  });

  const logger = pino({timestamp: false}, transport);
  logger.info({timestamp: time}, 'custom time key');
});

test('respects timeFormat option', (t) => {
  const transport = build({
    destination: createDestination(t),
    timeFormat: 'yyyy-MM-dd HH:mm:ss',
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time}, 'custom time format');
});

test('respects exclude option', (t) => {
  const transport = build({
    destination: createDestination(t),
    exclude: ['userId', 'sessionId'],
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info(
    {time, userId: 123, sessionId: 'abc', email: 'test@example.com'},
    'excluded fields',
  );
});

test('respects include option', (t) => {
  const transport = build({
    destination: createDestination(t),
    include: ['time', 'level', 'msg', 'email'],
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info(
    {time, userId: 123, email: 'test@example.com'},
    'included fields only',
  );
});

test('respects keyMap option', (t) => {
  const transport = build({
    destination: createDestination(t),
    keyMap: {
      msg: 'message',
    },
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time}, 'renamed fields');
});

test('respects singleLine option', (t) => {
  const transport = build({
    destination: createDestination(t),
    singleLine: true,
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info(
    {time, user: {id: 1, name: 'John'}, tags: ['admin', 'user']},
    'single line',
  );
});

test('formats with colors when supportsColor is true', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time}, 'colored output');
});

test('formats without colors when supportsColor is false', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: false,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time}, 'no colors');
});

test('formats with emoji when supportsUnicode is true', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time}, 'with emoji');
});

test('formats without emoji when supportsUnicode is false', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: false,
  });

  const logger = pino(transport);
  logger.info({time}, 'no emoji');
});

test('formats HTTP request method', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time, req: {method: 'GET', url: '/api/users'}}, 'request');
});

test('formats HTTP response status code', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time, res: {statusCode: 200}}, 'response');
});

test('formats HTTP response time', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time, responseTime: 123}, 'response time');
});

test('formats complete HTTP log', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info(
    {
      time,
      req: {method: 'POST', url: '/api/users'},
      res: {statusCode: 201},
      responseTime: 45,
    },
    'request completed',
  );
});

test('formats error with stack trace', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  const error = new Error('Something went wrong');
  logger.error({time, err: serializeError(error)}, 'Error occurred');
});

test('formats all log levels', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino({level: 'trace'}, transport);
  logger.trace({time}, 'trace message');
  logger.debug({time}, 'debug message');
  logger.info({time}, 'info message');
  logger.warn({time}, 'warn message');
  logger.error({time}, 'error message');
  logger.fatal({time}, 'fatal message');
});

test('formats nested objects', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info(
    {
      time,
      user: {
        id: 1,
        name: 'John Doe',
        profile: {
          email: 'john@example.com',
          roles: ['admin', 'user'],
        },
      },
    },
    'nested data',
  );
});

test('handles missing message', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  logger.info({time, userId: 123, action: 'login'});
});

test('formats log with name field', (t) => {
  const transport = build({
    destination: createDestination(t),
    colors: true,
    unicode: true,
  });

  const logger = pino(transport);
  const child = logger.child({name: 'my-service'});
  child.info({time}, 'service log');
});
