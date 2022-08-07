const { aql } = require('arangojs');
const { Router } = require('express');
const { connection } = require('../conn');
const { COLL_NOTES } = require('../const');
const { withErrorHandling } = require('../utils');

const router = Router();

const createNote = async (db, note) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    INSERT ${note} INTO ${notesColl}
    RETURN NEW
  `);
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
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    FOR n IN ${notes}
      INSERT n INTO ${notesColl}
    RETURN NEW
  `);
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

const readRandomNote = async (db) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    FOR n IN ${notesColl}
      SORT RAND()
      LIMIT 1
      RETURN n
  `);
  const result = await cursor.all();
  return result[0] || null;
});

router.get('/random', async (_, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNote = await readRandomNote(db);
    res.json(dbNote);
  } catch (error) {
    next(error);
  }
});

const readRandomNoteFromGroup = async (db, group) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    FOR n IN ${notesColl}
      FILTER n.group == ${group}
      SORT RAND()
      LIMIT 1
      RETURN n
  `);
  const result = await cursor.all();
  return result[0] || null;
});

router.get('/:group/random', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNote = await readRandomNoteFromGroup(db, req.params.group);
    res.json(dbNote);
  } catch (error) {
    next(error);
  }
});

const readAllNotes = async (db) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    FOR n IN ${notesColl}
      RETURN n
  `);
  const result = await cursor.all();
  return result;
});

router.get('/', async (_, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNotes = await readAllNotes(db);
    res.json(dbNotes);
  } catch (error) {
    next(error);
  }
});

const readAllNotesFromGroup = async (db, group) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    FOR n IN ${notesColl}
      FILTER n.group == ${group}
      RETURN n
  `);
  const result = await cursor.all();
  return result;
});

router.get('/:group', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNotes = await readAllNotesFromGroup(db, req.params.group);
    res.json(dbNotes);
  } catch (error) {
    next(error);
  }
});

const updateNote = async (db, key, updatedNote) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    UPDATE ${key} WITH ${updatedNote} IN ${notesColl}
    RETURN NEW
  `);
  const result = await cursor.all();
  return result;
});

router.put('/:key', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbNote = await updateNote(db, req.params.key, req.body);
    res.json(dbNote);
  } catch (error) {
    next(error);
  }
});

const deleteNote = async (db, key) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    REMOVE ${key} IN ${notesColl}
    LET removed = OLD
    RETURN removed
  `);
  const result = await cursor.all();
  return result;
});

router.delete('/:key', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const deletedNote = await deleteNote(db, req.params.key);
    res.json(deletedNote);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
