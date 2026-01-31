import {prettify as createPrettify} from '../index.ts';

const _prettify = createPrettify();
const prettify = (obj: Record<string, unknown>) =>
  _prettify(obj)?.replace(/\n$/, '');

const createBasicMessage = (level: number, withStatusCode: boolean, inc = 0) =>
  prettify({
    level,
    msg: withStatusCode ? 'Request Complete' : 'Some data in the request',
    time: new Date().toISOString(),
    req: {
      id: inc + 1,
      method: 'DELETE',
      url: '/api/basic',
    },
    res: {
      statusCode: withStatusCode ? 200 : undefined,
    },
    data: {
      sample: 'data',
    },
  });

console.log(createBasicMessage(10, false, 0));
console.log(createBasicMessage(10, true, 1));
console.log(createBasicMessage(20, false, 2));
console.log(createBasicMessage(20, true, 3));
console.log(createBasicMessage(30, false, 4));
console.log(createBasicMessage(30, true, 5));
console.log(createBasicMessage(40, false, 6));
console.log(createBasicMessage(40, true, 7));
console.log(createBasicMessage(50, false, 8));
console.log(createBasicMessage(50, true, 9));
console.log(createBasicMessage(60, false, 10));
console.log(createBasicMessage(60, true, 11));
