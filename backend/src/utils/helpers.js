function createRequestCode(prefix = "REQ") {
  return `${prefix}-${Date.now()}`;
}

function pick(object, keys = []) {
  return keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }

    return result;
  }, {});
}

module.exports = {
  createRequestCode,
  pick,
};
