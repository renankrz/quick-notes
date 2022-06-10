const mongoose = require('mongoose');

const { Schema } = mongoose;

const noteSchema = new Schema({
  group: String,
  title: String,
  markdown: String,
  rank: Number,
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
