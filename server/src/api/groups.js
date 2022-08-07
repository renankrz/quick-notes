const { aql } = require('arangojs');
const { Router } = require('express');
const { connection } = require('../conn');
const { COLL_NOTES } = require('../const');
const { withErrorHandling } = require('../utils');

const router = Router();

const readAllGroups = async (db) => withErrorHandling(async () => {
  const notesColl = db.collection(COLL_NOTES);
  const cursor = await db.query(aql`
    LET groups = (
      FOR n IN ${notesColl}
        RETURN DISTINCT n.group
    )
    FOR g IN groups
      SORT g
      RETURN g      
  `);
  const result = await cursor.all();
  return result;
});

router.get('/', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbGroups = await readAllGroups(db);
    res.json(dbGroups);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
