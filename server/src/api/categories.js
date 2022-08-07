const { aql } = require('arangojs');
const { Router } = require('express');
const { connection } = require('../conn');
const { COLL_NOTES } = require('../const');
const { withErrorHandling } = require('../utils');

const router = Router();

const readAllCategories = async (db) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    LET categories = (
      FOR n IN ${notesColl}
        RETURN DISTINCT n.category
    )
    FOR c IN categories
      SORT c
      RETURN c
  `);
  const result = await cursor.all();
  return result;
});

router.get('/', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbCategories = await readAllCategories(db);
    res.json(dbCategories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
