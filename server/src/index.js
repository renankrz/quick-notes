const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();
const notes = require('./api/notes');

const app = express();

mongoose.connect(`${process.env.DB_HOST}${process.env.DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useFindAndModify', false);

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/notes', notes);

app.listen(process.env.API_PORT);
