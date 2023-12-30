module.exports = async () => {
  const m = await import('./index.js');

  return m.default({});
};
