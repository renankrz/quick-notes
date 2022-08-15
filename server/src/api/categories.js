/* eslint-disable no-underscore-dangle */
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
  const cursor = await db.query({
    query: `
      FOR c IN @@collection
        SORT c
        RETURN c
    `,
    bindVars: {
      '@collection': COLL_CATEGORIES,
    },
  });
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
  const verticesCursor = await db.query({
    query: `
      FOR v IN @@collection
        RETURN { key: v._key, name: v.name }
    `,
    bindVars: {
      '@collection': COLL_CATEGORIES,
    },
  });
  const edgesCursor = await db.query({
    query: `
      LET rootArray = (
        FOR c IN @@collection
          FILTER c.name == 'root'
          LIMIT 1
          RETURN c
      )
      LET root = rootArray[0]
      FOR v, e
      IN 1..99
      OUTBOUND root._id
      GRAPH @graph
      OPTIONS { order: 'bfs' }
        RETURN { from: e._from, to: e._to }
    `,
    bindVars: {
      '@collection': COLL_CATEGORIES,
      graph: GRAPH_CATEGORIES,
    },
  });

  const vertices = await verticesCursor.all();
  const edges = (await edgesCursor.all()).reverse().map((e) => ({
    from: e.from.split('/')[1],
    to: e.to.split('/')[1],
  }));
  const categories = vertices.map((v) => ({
    ...v,
    children: [],
  }));

  for (let i = 0; i < edges.length; i += 1) {
    // Get the element with key "from" in "categories" (removing)
    const indexFrom = categories.findIndex((v) => v.key === edges[i].from);
    const from = categories.splice(indexFrom, 1)[0];
    // Get the element with key "to" in "categories" (removing)
    const indexTo = categories.findIndex((v) => v.key === edges[i].to);
    const to = categories.splice(indexTo, 1)[0];
    // Put the "to" into the "children" array of "from"
    from.children.push(to);
    // Put the new vertex into "categories"
    categories.push(from);
  }

  return {
    categories: categories[0],
    edges,
    vertices,
  };
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
