const { Router } = require('express');
const Note = require('../models/Note');

const router = Router();

// createNote
router.post('/', async (req, res, next) => {
  try {
    const note = new Note(req.body);
    const createdNote = await note.save();
    res.json(createdNote);
  } catch (error) {
    next(error);
  }
});

// readGroups
router.get('/groups', async (req, res, next) => {
  try {
    const distinctGroups = await Note.distinct('group');
    res.json(distinctGroups);
  } catch (error) {
    next(error);
  }
});

// readRandomNote
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

// readRandomNoteFromGroup
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

// readAllNotes
router.get('/', async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ rank: 'asc' });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// readAllNotesFromGroup
router.get('/:group', async (req, res, next) => {
  try {
    const notes = await Note.find({ group: req.params.group }).sort({ rank: 'asc' });
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// updateNote
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

// deleteNote
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    res.json(deletedNote);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
