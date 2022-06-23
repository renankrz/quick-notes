const { Router } = require('express');
const Note = require('../models/Note');

const router = Router();

// Create note
router.post('/', async (req, res, next) => {
  try {
    const note = new Note(req.body);
    const createdNote = await note.save();
    res.json(createdNote);
  } catch (error) {
    next(error);
  }
});

// Create multiple notes
router.post('/multiple', async (req, res, next) => {
  const notes = req.body;
  try {
    const createdNotes = await Note.insertMany(notes);
    res.json(createdNotes);
  } catch (error) {
    next(error);
  }
});

// Read random note
router.get('/random', async (req, res, next) => {
  try {
    const count = await Note.countDocuments();
    const randomN = Math.floor(Math.random() * count);
    const note = await Note.findOne().skip(randomN);
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// Read random note from group
router.get('/:group/random', async (req, res, next) => {
  try {
    const count = await Note.find({ group: req.params.group }).countDocuments();
    const randomN = Math.floor(Math.random() * count);
    const note = await Note.find({ group: req.params.group }).findOne().skip(randomN);
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// Read all notes
router.get('/', async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ rank: 'asc' });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// Read all notes from group
router.get('/:group', async (req, res, next) => {
  try {
    const notes = await Note.find({ group: req.params.group }).sort({ rank: 'asc' });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// Update note
router.put('/:id', async (req, res, next) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
    );
    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
});

// Delete note
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    res.json(deletedNote);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
