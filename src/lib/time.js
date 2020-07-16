async function time(key, cb) {
  console.time(key);

  const result = await cb();

  console.timeEnd(key);

  return result;
}

async function timeCommand(command, cb) {
  const key = `✨ ${command}`;

  try {
    return await time(key, cb);
  } catch (error) {
    console.log(error);
    console.log(`❌ ${command}`);
  }
}

module.exports = { time, timeCommand };
