const { Router } = require('express');
const {
  getCategoriesByName,
  getCategoryByKey,
} = require('../db/categories-tree-db');
const {
  countNotes,
  createNote,
  deleteAllNotes,
  deleteNote,
  getAllNotes,
  getNoteByKey,
  moveAllNotes,
  moveNote,
  updateNote,
} = require('../db/notes-db');
const { HttpError } = require('../http-error');

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

// Count notes in a category (optionally its subtree). Used for confirmations.
router.get('/count', async (req, res, next) => {
  try {
    const { categoryKey } = req.query;
    if (!categoryKey) {
      throw new HttpError(400, 'A "categoryKey" query parameter is required');
    }
    const includeDescendants = req.query.includeDescendants === 'true';
    const count = await countNotes(categoryKey, includeDescendants);
    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// Move all notes from one category (optionally its subtree) to another.
// Body: { fromCategoryKey, toCategoryKey, includeDescendants?, confirm: true }.
router.post('/move', async (req, res, next) => {
  try {
    const {
      fromCategoryKey,
      toCategoryKey,
      includeDescendants = false,
      confirm,
    } = req.body;
    if (!fromCategoryKey || !toCategoryKey) {
      throw new HttpError(
        400,
        '"fromCategoryKey" and "toCategoryKey" are required',
      );
    }
    if (fromCategoryKey === toCategoryKey) {
      throw new HttpError(400, 'Source and target categories must differ');
    }
    if (confirm !== true) {
      throw new HttpError(400, 'This bulk operation requires "confirm": true');
    }
    const moved = await moveAllNotes(
      fromCategoryKey,
      toCategoryKey,
      includeDescendants,
    );
    res.json({ moved });
  } catch (error) {
    next(error);
  }
});

// Delete all notes from a category (optionally its subtree).
// Query: ?categoryKey=...&includeDescendants=...  Body: { confirm: true }.
router.delete('/', async (req, res, next) => {
  try {
    const { categoryKey } = req.query;
    if (!categoryKey) {
      throw new HttpError(400, 'A "categoryKey" query parameter is required');
    }
    if (req.body.confirm !== true) {
      throw new HttpError(400, 'This bulk operation requires "confirm": true');
    }
    const includeDescendants = req.query.includeDescendants === 'true';
    const deleted = await deleteAllNotes(categoryKey, includeDescendants);
    res.json({ deleted });
  } catch (error) {
    next(error);
  }
});

// Move a single note to another category. Body: { categoryKey }.
router.patch('/:key/category', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { categoryKey } = req.body;
    if (!categoryKey) {
      throw new HttpError(400, 'A "categoryKey" is required');
    }
    const note = await getNoteByKey(key);
    if (!note.length) {
      throw new HttpError(404, 'The specified note does not exist');
    }
    const category = await getCategoryByKey(categoryKey);
    if (!category.length) {
      throw new HttpError(404, 'The target category does not exist');
    }
    const updated = await moveNote(key, categoryKey);
    res.json(updated);
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
