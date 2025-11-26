// eslint-disable-next-line unicorn/no-anonymous-default-export
module.exports = async () => {
  const m = await import('./index.js');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return m.default({});
};
