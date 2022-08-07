const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const notes = require('./api/notes');
const groups = require('./api/groups');

const app = express();

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(',').map((origin) => (
    `http://${origin}:${process.env.CLIENT_PORT}`
  )),
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'));

app.use('/api/notes', notes);
app.use('/api/groups', groups);

app.listen(process.env.API_PORT);
