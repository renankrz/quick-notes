/* eslint-disable no-underscore-dangle */
const { aql } = require('arangojs');
const { Router } = require('express');
const { connection } = require('../conn');
const { COLL_CATEGORIES, COLL_HAS_SUBCATEGORY } = require('../const');
const { withErrorHandling } = require('../utils');

const router = Router();

const createCategory = async (db, category, parentKey) => withErrorHandling(async () => {
  const categoriesColl = db.collection(COLL_CATEGORIES);
  const hasSubcategory = db.collection(COLL_HAS_SUBCATEGORY);
  const dbCategory = await categoriesColl.save(category, {
    returnNew: true,
  });
  const parentId = `${COLL_CATEGORIES}/${parentKey}`;
  const childId = `${COLL_CATEGORIES}/${dbCategory.new._key}`;
  await hasSubcategory.save({
    _from: parentId,
    _to: childId,
  });
  return dbCategory.new;
});

router.post('/', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbCategory = await createCategory(db, req.body.category, req.body.parentKey);
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

const deleteCategory = async (db, key) => withErrorHandling(async () => {
  const categoriesColl = db.collection(COLL_CATEGORIES);
  const dbCategory = await categoriesColl.remove(key, {
    returnOld: true,
  });
  return dbCategory.old;
});

router.delete('/:key', async (req, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const deletedCategory = await deleteCategory(db, req.params.key);
    res.json(deletedCategory);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
