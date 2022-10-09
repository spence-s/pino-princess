function isObject(input: unknown): boolean {
  return Boolean(
    input && Object.prototype.toString.apply(input) === '[object Object]',
  );
}

export default isObject;
