const withErrorHandling = async (cb) => {
  try {
    const res = await cb();
    return res;
  } catch (arangoErr) {
    // eslint-disable-next-line no-console
    console.error(arangoErr.stack);
    throw new Error(arangoErr.message);
  }
};

module.exports = {
  withErrorHandling,
};
