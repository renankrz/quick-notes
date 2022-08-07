const { aql } = require('arangojs');
const { Router } = require('express');
const { connection } = require('../conn');
const { COLL_CATEGORIES } = require('../const');
const { withErrorHandling } = require('../utils');

const router = Router();

const createCategory = async (db, category) => withErrorHandling(async () => {
  const categoriesColl = db.collection(COLL_CATEGORIES);
  const cursor = await db.query(aql`
    INSERT ${category} INTO ${categoriesColl}
    RETURN NEW
  `);
  const result = await cursor.all();
  return result;
});

router.post('/', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbCategory = await createCategory(db, req.body);
    res.json(dbCategory);
  } catch (error) {
    next(error);
  }
});

const readAllCategories = async (db) => withErrorHandling(async () => {
  const categoriesColl = db.collection(COLL_CATEGORIES);
  const cursor = await db.query(aql`
    FOR c IN ${categoriesColl}
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
