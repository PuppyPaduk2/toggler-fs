function nodePromise(callback, ...args) {
  return new Promise((resolve, reject) => {
    callback(...args, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });
  });
}

module.exports = { nodePromise };
