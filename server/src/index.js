const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();
const notes = require('./api/notes');
const groups = require('./api/groups');

const app = express();

mongoose.connect(`${process.env.DB_HOST}${process.env.DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useFindAndModify', false);

const corsOptions = {
  origin: [`http://localhost:${process.env.CLIENT_PORT}`],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'));

app.use('/api/notes', notes);
app.use('/api/groups', groups);

app.listen(process.env.API_PORT);
