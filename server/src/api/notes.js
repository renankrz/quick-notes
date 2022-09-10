const { Router } = require('express');
const { connection } = require('../conn');
const { COLL_NOTES, GRAPH_CATEGORIES } = require('../const');
const { withErrorHandling } = require('../utils');

const router = Router();

const createNote = async (db, note) => withErrorHandling(async () => {
  const correctlyTypedData = {
    ...note,
    rank: parseInt(note.rank, 10),
  };
  const cursor = await db.query({
    query: `
      INSERT @note INTO @@collection
      RETURN NEW
    `,
    bindVars: {
      '@collection': COLL_NOTES,
      note: correctlyTypedData,
    },
  });
  const result = await cursor.all();
  return result;
});

router.post('/', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNote = await createNote(db, req.body);
    res.json(dbNote);
  } catch (error) {
    next(error);
  }
});

const createMultipleNotes = async (db, notes) => withErrorHandling(async () => {
  const cursor = await db.query({
    query: `
      FOR n IN @notes
        INSERT n INTO @@collection
      RETURN NEW
    `,
    bindVars: {
      '@collection': COLL_NOTES,
      notes,
    },
  });
  const result = await cursor.all();
  return result;
});

router.post('/multiple', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNotes = await createMultipleNotes(db, req.body);
    res.json(dbNotes);
  } catch (error) {
    next(error);
  }
});

const readRandomNote = async (db, categoriesKeys) => withErrorHandling(async () => {
  const startVerticesKeys = categoriesKeys.map((k) => `categories/${k}`);
  const cursor = await db.query({
    query: `
      LET allKeys = (
        FOR startVertex IN @startVerticesKeys
          FOR v
          IN 0..99
          OUTBOUND startVertex
          GRAPH @graph
            RETURN DISTINCT v._key
      )
      FOR n IN @@collection
      FILTER n.categoryKey IN allKeys
      SORT RAND()
      LIMIT 1
        RETURN {
          key: n._key,
          categoryKey: n.categoryKey,
          content: n.content,
          rank: n.rank,
          title: n.title,
        }
    `,
    bindVars: {
      '@collection': COLL_NOTES,
      graph: GRAPH_CATEGORIES,
      startVerticesKeys,
    },
  });
  const result = await cursor.all();
  return result;
});

router.get('/random', async (req, res, next) => {
  const categoriesKeys = Array.isArray(req.query.cat)
    ? req.query.cat
    : [req.query.cat];
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNote = await readRandomNote(db, categoriesKeys);
    res.json(dbNote);
  } catch (error) {
    next(error);
  }
});

const readAllNotes = async (db, categoriesKeys) => withErrorHandling(async () => {
  const startVerticesKeys = categoriesKeys.map((k) => `categories/${k}`);
  const cursor = await db.query({
    query: `
      LET allKeys = (
        FOR startVertex IN @startVerticesKeys
          FOR v
          IN 0..99
          OUTBOUND startVertex
          GRAPH @graph
            RETURN DISTINCT v._key
      )
      FOR n IN @@collection
      FILTER n.categoryKey IN allKeys
      SORT n.rank
        RETURN {
          key: n._key,
          categoryKey: n.categoryKey,
          content: n.content,
          rank: n.rank,
          title: n.title,
        }
    `,
    bindVars: {
      '@collection': COLL_NOTES,
      graph: GRAPH_CATEGORIES,
      startVerticesKeys,
    },
  });
  const result = await cursor.all();
  return result;
});

router.get('/', async (req, res, next) => {
  const categoriesKeys = Array.isArray(req.query.cat)
    ? req.query.cat
    : [req.query.cat];
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNotes = await readAllNotes(db, categoriesKeys);
    res.json(dbNotes);
  } catch (error) {
    next(error);
  }
});

const updateNote = async (db, key, updatedNote) => withErrorHandling(async () => {
  const correctlyTypedData = {
    ...updatedNote,
    rank: parseInt(updatedNote.rank, 10),
  };
  const cursor = await db.query({
    query: `
      UPDATE @key WITH @updatedNote IN @@collection
      RETURN NEW
    `,
    bindVars: {
      '@collection': COLL_NOTES,
      key,
      updatedNote: correctlyTypedData,
    },
  });
  const result = await cursor.all();
  return result;
});

router.put('/:notekey', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNote = await updateNote(db, req.params.notekey, req.body);
    res.json(dbNote);
  } catch (error) {
    next(error);
  }
});

const deleteNote = async (db, key) => withErrorHandling(async () => {
  const cursor = await db.query({
    query: `
      REMOVE @key IN @@collection
      RETURN OLD
    `,
    bindVars: {
      '@collection': COLL_NOTES,
      key,
    },
  });
  const result = await cursor.all();
  return result;
});

router.delete('/:notekey', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const deletedNote = await deleteNote(db, req.params.notekey);
    res.json(deletedNote);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
