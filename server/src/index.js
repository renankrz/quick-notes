const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const notes = require('./api/notes');

const app = express();

mongoose.connect('mongodb://localhost/quickNotesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useFindAndModify', false);

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/notes', notes);

app.listen(1337);
