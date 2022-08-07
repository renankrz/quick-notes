const { Database } = require('arangojs');
const dotenv = require('dotenv');

dotenv.config();

const connection = new Database({
  url: process.env.DB_HOST,
  auth: { username: process.env.DB_USER, password: process.env.DB_PASS },
  precaptureStackTraces: true,
});

module.exports = {
  connection,
};
