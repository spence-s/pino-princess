function isEmpty(object) {
  return (
    object === undefined || object === null || Object.keys(object).length === 0
  );
}

module.exports = isEmpty;
