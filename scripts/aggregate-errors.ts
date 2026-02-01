import {err} from 'pino-std-serializers';
import pino from 'pino';
import {prettify} from '../index.ts';

const error = new Error('Something went wrong internally 1');
const error2 = new Error('Something went wrong internally 2');

const aggregateError = new AggregateError(
  [error, error2],
  'Multiple things went wrong',
);

// console.log(err(aggregateError));

// pino().error({
//   msg: 'Here is an aggregated error printed nicely:',
//   err: aggregateError,
// });

console.log(
  prettify()(
    JSON.stringify({
      level: 50,
      time: new Date(),
      msg: 'Here is an aggregated error printed nicely:',
      err: err(aggregateError),
    }),
  ),
);
