import isObject from './is-object';

function isEmpty(object: unknown): boolean {
  return Boolean(
    isObject(object) &&
      (object === undefined ||
        object === null ||
        Object.keys(object).length === 0),
  );
}

export default isEmpty;
