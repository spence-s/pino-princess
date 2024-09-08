// eslint-disable-next-line unicorn/no-anonymous-default-export
module.exports = async () => {
  const m = await import('./index.js');

  return m.default({});
};
