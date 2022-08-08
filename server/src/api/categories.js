/* eslint-disable no-underscore-dangle */
const { aql } = require('arangojs');
const { Router } = require('express');
const { connection } = require('../conn');
const { COLL_CATEGORIES, COLL_HAS_SUBCATEGORY, GRAPH_CATEGORIES } = require('../const');
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

const readAllCategoriesRich = async (db) => withErrorHandling(async () => {
  const categoriesColl = db.collection(COLL_CATEGORIES);

  const verticesCursor = await db.query(aql`
    FOR v IN ${categoriesColl}
      return v
  `);
  const edgesCursor = await db.query(aql`
    LET rootArray = (
      FOR c IN ${categoriesColl}
        FILTER c.name == 'root'
        LIMIT 1
        RETURN c
    )
    LET root = rootArray[0]
    FOR v, e
    IN 1..99
    OUTBOUND root._id
    GRAPH ${GRAPH_CATEGORIES}
    OPTIONS { order: 'bfs' }
      RETURN { from: e._from, to: e._to }
  `);

  const vertices = await verticesCursor.all();
  const edges = (await edgesCursor.all()).reverse();

  const categories = vertices.map((v) => ({
    ...v,
    children: [],
  }));

  for (let i = 0; i < edges.length; i += 1) {
    // Get the element with id "from" in "categories" (removing)
    const indexFrom = categories.findIndex((v) => v._id === edges[i].from);
    const from = categories.splice(indexFrom, 1)[0];
    // Get the element with id "to" in "categories" (removing)
    const indexTo = categories.findIndex((v) => v._id === edges[i].to);
    const to = categories.splice(indexTo, 1)[0];
    // Put the "to" into the "children" array of "from"
    from.children.push(to);
    // Put the new vertex into "categories"
    categories.push(from);
  }

  return categories[0];
});

router.get('/rich', async (_, res, next) => {
  try {
    const db = connection.database(process.env.DB_NAME);
    const dbCategories = await readAllCategoriesRich(db);
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
