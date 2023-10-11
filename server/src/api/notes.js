const { Router } = require('express');
const { getCategoriesByName } = require('../db/categories-tree-db');
const {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteByKey,
  updateNote,
} = require('../db/notes-db');

const router = Router();

router.get('/', async (req, res, next) => {
  let categoriesKeys;
  if (req.query.categories) {
    categoriesKeys = req.query.categories.split(',');
  } else {
    categoriesKeys = [(await getCategoriesByName('root'))[0].key];
  }
  try {
    const dbNotes = await getAllNotes(categoriesKeys);
    res.json(dbNotes);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const dbNote = await createNote(req.body);
    res.json(dbNote);
  } catch (error) {
    next(error);
  }
});

router.delete('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const note = await getNoteByKey(key);
    if (!note.length) {
      res.status(400);
      res.send('The specified note does not exist');
      return;
    }
    const deletedNote = await deleteNote(key);
    res.json(deletedNote);
  } catch (error) {
    next(error);
  }
});

router.put('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const note = await getNoteByKey(key);
    if (!note.length) {
      res.status(400);
      res.send('The specified note does not exist');
      return;
    }
    const updatedNote = await updateNote(key, req.body);
    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
