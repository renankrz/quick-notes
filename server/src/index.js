const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const categories = require('./api/categories');
const notes = require('./api/notes');

const app = express();

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(',').map((origin) => (
    `http://${origin}:${process.env.CLIENT_PORT}`
  )),
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'));

app.use('/api/categories', categories);
app.use('/api/notes', notes);

app.listen(process.env.API_PORT);
