const dotenv = require('dotenv');
const { Database } = require('arangojs');

dotenv.config();

const db = new Database({
  url: process.env.DB_HOST,
  databaseName: process.env.DB_NAME,
  auth: { username: process.env.DB_USER, password: process.env.DB_PASS },
  precaptureStackTraces: true,
});

const withErrorHandling = async (cb) => {
  try {
    const res = await cb();
    return res;
  } catch (arangoErr) {
    console.error(arangoErr.stack);
    throw new Error(arangoErr.message);
  }
};

module.exports = {
  db,
  withErrorHandling,
};
