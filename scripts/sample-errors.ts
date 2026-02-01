import {prettify} from '../index.ts';

const error = new Error('Something went wrong');

console.log(
  prettify()({
    level: 50,
    time: new Date(),
    msg: 'Here is an error printed nicely:',
    err: {
      type: 'Error',
      message: error.message,
      stack: error.stack,
    },
  }),
);

console.log();

console.log(
  prettify()({
    level: 50,
    time: new Date(),
    msg: 'Here is an error printed nicely with extra data:',
    err: {
      type: 'Error',
      message: error.message,
      stack: error.stack,
      extra: 'fields on an error',
      nicely: 'displayed by default',
      right: 'below the error stack!',
    },
  }),
);

console.log();

console.log(
  prettify({errorLikeKeys: ['errata']})({
    level: 50,
    time: new Date(),
    msg: 'Here is an error printed nicely with error like keys of errata:',
    errata: {
      type: 'Error',
      message: error.message,
      stack: error.stack,
      extra: 'fields on an error',
      nicely: 'displayed by default',
      right: 'below the error stack!',
    },
  }),
);
