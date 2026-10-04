const { db, withErrorHandling } = require('./common');

const {
  COLL_CATEGORIES,
  COLL_HAS_SUBCATEGORY,
  COLL_NOTES,
  GRAPH_CATEGORIES,
  MAX_TREE_DEPTH,
} = require('../constants');

const createCategory = (name) =>
  withErrorHandling(async () => {
    const query = `
      INSERT
      {
        name: @name,
      }
      IN @@collection
      RETURN NEW
    `;
    const bindVars = {
      '@collection': COLL_CATEGORIES,
      name,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const [vertex] = await cursor.all();
    return {
      key: vertex._key,
      name: vertex.name,
    };
  });

const createEdge = (parentKey, childKey) =>
  withErrorHandling(async () => {
    const query = `
      INSERT
      {
        _from: @parentId,
        _to: @childId,
      }
      IN @@collection
    `;
    const bindVars = {
      '@collection': COLL_HAS_SUBCATEGORY,
      parentId: `${COLL_CATEGORIES}/${parentKey}`,
      childId: `${COLL_CATEGORIES}/${childKey}`,
    };
    await db.query({
      query,
      bindVars,
    });
  });

const getAllCategories = () =>
  withErrorHandling(async () => {
    const query = `
      FOR v IN @@collection
      RETURN v
    `;
    const bindVars = {
      '@collection': COLL_CATEGORIES,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const vertices = await cursor.all();
    return vertices.map((v) => {
      return {
        key: v._key,
        name: v.name,
      };
    });
  });

const getCategoriesByName = (name) =>
  withErrorHandling(async () => {
    const query = `
      FOR v IN @@collection
      FILTER v.name == @name
      RETURN v
    `;
    const bindVars = {
      '@collection': COLL_CATEGORIES,
      name,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const vertices = await cursor.all();
    return vertices.map((v) => {
      return {
        key: v._key,
        name: v.name,
      };
    });
  });

const getCategoryByKey = (key) =>
  withErrorHandling(async () => {
    const query = `
      FOR v IN @@collection
      FILTER v._key == @key
      RETURN v
    `;
    const bindVars = {
      '@collection': COLL_CATEGORIES,
      key,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const vertex = await cursor.all();
    return vertex.map((v) => {
      return {
        key: v._key,
        name: v.name,
      };
    });
  });

const getExpandableCategories = () =>
  withErrorHandling(async () => {
    const query = `
      FOR v IN @@v_collection
      FOR e IN @@e_collection
      FILTER v._id == e._from
      RETURN DISTINCT v
    `;
    const bindVars = {
      '@v_collection': COLL_CATEGORIES,
      '@e_collection': COLL_HAS_SUBCATEGORY,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const vertices = await cursor.all();
    return vertices.map((v) => {
      return {
        key: v._key,
        name: v.name,
      };
    });
  });

const getEdgeByKey = (key) =>
  withErrorHandling(async () => {
    const query = `
      FOR e IN @@collection
      FILTER e._key == @key
      RETURN e
    `;
    const bindVars = {
      '@collection': COLL_HAS_SUBCATEGORY,
      key,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const edge = await cursor.all();
    if (!edge.length) {
      return [];
    }
    const from = (await getCategoryByKey(edge[0]._from.split('/')[1]))[0];
    const to = (await getCategoryByKey(edge[0]._to.split('/')[1]))[0];
    return edge.map((e) => {
      return {
        key: e._key,
        from,
        to,
      };
    });
  });

const getIncomingEdges = (to) =>
  withErrorHandling(async () => {
    const refVertex = await getCategoryByKey(to);
    const query = `
      FOR v IN @@v_collection
      FOR e IN @@e_collection
      FILTER e._to == @to && v._id == e._from
      RETURN { e, v }
    `;
    const bindVars = {
      '@v_collection': COLL_CATEGORIES,
      '@e_collection': COLL_HAS_SUBCATEGORY,
      to: `${COLL_CATEGORIES}/${to}`,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const pairsEdgeVertex = await cursor.all();
    return pairsEdgeVertex.map((pair) => {
      return {
        key: pair.e._key,
        from: {
          key: pair.v._key,
          name: pair.v.name,
        },
        to: {
          key: refVertex[0].key,
          name: refVertex[0].name,
        },
      };
    });
  });

const getOutcomingEdges = (from) =>
  withErrorHandling(async () => {
    const refVertex = await getCategoryByKey(from);
    const query = `
      FOR v IN @@v_collection
      FOR e IN @@e_collection
      FILTER e._from == @from && v._id == e._to
      RETURN { e, v }
    `;
    const bindVars = {
      '@v_collection': COLL_CATEGORIES,
      '@e_collection': COLL_HAS_SUBCATEGORY,
      from: `${COLL_CATEGORIES}/${from}`,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const pairsEdgeVertex = await cursor.all();
    return pairsEdgeVertex.map((pair) => {
      return {
        key: pair.e._key,
        from: {
          key: refVertex[0].key,
          name: refVertex[0].name,
        },
        to: {
          key: pair.v._key,
          name: pair.v.name,
        },
      };
    });
  });

const getPaths = () =>
  withErrorHandling(async () => {
    const root = (await getCategoriesByName('root'))[0];
    if (!root) {
      return [];
    }
    const query = `
      FOR v, e, p
      IN 0..99
      OUTBOUND @rootId
      GRAPH @graph
      RETURN p
    `;
    const bindVars = {
      graph: GRAPH_CATEGORIES,
      rootId: `${COLL_CATEGORIES}/${root.key}`,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const paths = await cursor.all();
    return paths.map((p) => {
      return {
        key: p.vertices.slice(-1)[0]._key,
        vertices: p.vertices.map((v) => {
          return v.name;
        }),
      };
    });
  });

const getPathsFlattened = () =>
  withErrorHandling(async () => {
    const root = (await getCategoriesByName('root'))[0];
    if (!root) {
      return [];
    }
    const query = `
      FOR v, e, p
      IN 1..99
      OUTBOUND @rootId
      GRAPH @graph
      RETURN p
    `;
    const bindVars = {
      graph: GRAPH_CATEGORIES,
      rootId: `${COLL_CATEGORIES}/${root.key}`,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const paths = await cursor.all();
    return paths.map((p) => {
      return {
        key: p.vertices.slice(-1)[0]._key,
        vertices: p.vertices
          .slice(1)
          .map((v) => {
            return v.name;
          })
          .reduce(
            (previousValue, currentValue) =>
              `${previousValue} > ${currentValue}`,
            '',
          )
          .slice(3),
      };
    });
  });

const getTree = async () =>
  withErrorHandling(async () => {
    const root = (await getCategoriesByName('root'))[0];
    if (!root) {
      return [];
    }
    const query = `
      FOR v, e
      IN 0..99
      OUTBOUND @rootId
      GRAPH @graph
      OPTIONS { order: "bfs" }
      RETURN { v, e }
    `;
    const bindVars = {
      graph: GRAPH_CATEGORIES,
      rootId: `${COLL_CATEGORIES}/${root.key}`,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const pairs = (await cursor.all()).reverse();
    const categories = pairs.map((pair) => {
      return {
        key: pair.v._key,
        name: pair.v.name,
        parentKey: pair.e?._from.split('/')[1],
        children: [],
      };
    });
    for (let i = 0; i < categories.length - 1; i += 1) {
      const c = categories[i];
      categories[
        categories.findIndex((x) => x.key === c.parentKey)
      ].children.push(c);
    }
    return [categories.find((c) => c.name === 'root')];
  });

const updateEdge = (key, from, to) =>
  withErrorHandling(async () => {
    const query = `
      UPDATE
      {
        _key: @key,
        _from: @from,
        _to: @to,
      }
      IN @@collection
      RETURN NEW
    `;
    const bindVars = {
      '@collection': COLL_HAS_SUBCATEGORY,
      key,
      from: `${COLL_CATEGORIES}/${from}`,
      to: `${COLL_CATEGORIES}/${to}`,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const [edge] = await cursor.all();
    return {
      key: edge._key,
      from: edge._from.split('/')[1],
      to: edge._to.split('/')[1],
    };
  });

/**
 * Number of direct subcategories of a category.
 */
const getChildrenCount = (key) =>
  withErrorHandling(async () => {
    const query = `
      RETURN LENGTH(
        FOR e IN @@collection
        FILTER e._from == @from
        RETURN 1
      )
    `;
    const bindVars = {
      '@collection': COLL_HAS_SUBCATEGORY,
      from: `${COLL_CATEGORIES}/${key}`,
    };
    const cursor = await db.query({ query, bindVars });
    const [count] = await cursor.all();
    return count;
  });

/**
 * Number of notes attached directly to a category.
 */
const getNotesCount = (key) =>
  withErrorHandling(async () => {
    const query = `
      RETURN LENGTH(
        FOR n IN @@collection
        FILTER n.categoryKey == @key
        RETURN 1
      )
    `;
    const bindVars = {
      '@collection': COLL_NOTES,
      key,
    };
    const cursor = await db.query({ query, bindVars });
    const [count] = await cursor.all();
    return count;
  });

/**
 * Keys of all descendants of a category (excluding the category itself).
 */
const getDescendantKeys = (key) =>
  withErrorHandling(async () => {
    const query = `
      FOR v IN 1..@maxDepth OUTBOUND @startId GRAPH @graph
      RETURN DISTINCT v._key
    `;
    const bindVars = {
      maxDepth: MAX_TREE_DEPTH,
      graph: GRAPH_CATEGORIES,
      startId: `${COLL_CATEGORIES}/${key}`,
    };
    const cursor = await db.query({ query, bindVars });
    return cursor.all();
  });

/**
 * Create a category and, when a parent is given, the edge linking it, in a
 * single stream transaction so a failure cannot leave an orphan vertex/edge.
 */
const addCategory = (name, parentKey) =>
  withErrorHandling(async () => {
    const trx = await db.beginTransaction({
      write: [COLL_CATEGORIES, COLL_HAS_SUBCATEGORY],
    });
    try {
      const [vertex] = await trx.step(() =>
        db
          .query({
            query: `INSERT { name: @name } IN @@collection RETURN NEW`,
            bindVars: { '@collection': COLL_CATEGORIES, name },
          })
          .then((c) => c.all()),
      );
      if (parentKey) {
        await trx.step(() =>
          db.query({
            query: `INSERT { _from: @from, _to: @to } IN @@collection`,
            bindVars: {
              '@collection': COLL_HAS_SUBCATEGORY,
              from: `${COLL_CATEGORIES}/${parentKey}`,
              to: `${COLL_CATEGORIES}/${vertex._key}`,
            },
          }),
        );
      }
      await trx.commit();
      return {
        key: vertex._key,
        name: vertex.name,
        parentKey: parentKey || null,
      };
    } catch (err) {
      await trx.abort();
      throw err;
    }
  });

/**
 * Rename a category.
 */
const renameCategory = (key, name) =>
  withErrorHandling(async () => {
    const query = `
      UPDATE @key WITH { name: @name } IN @@collection
      RETURN NEW
    `;
    const bindVars = { '@collection': COLL_CATEGORIES, key, name };
    const cursor = await db.query({ query, bindVars });
    const [vertex] = await cursor.all();
    return { key: vertex._key, name: vertex.name };
  });

/**
 * Delete a category and its incoming edge in one transaction. Callers must have
 * already verified it has no notes and no subcategories.
 */
const deleteCategory = (key) =>
  withErrorHandling(async () => {
    const trx = await db.beginTransaction({
      write: [COLL_CATEGORIES, COLL_HAS_SUBCATEGORY],
    });
    try {
      await trx.step(() =>
        db.query({
          query: `FOR e IN @@collection FILTER e._to == @to REMOVE e IN @@collection`,
          bindVars: {
            '@collection': COLL_HAS_SUBCATEGORY,
            to: `${COLL_CATEGORIES}/${key}`,
          },
        }),
      );
      await trx.step(() =>
        db.query({
          query: `REMOVE @key IN @@collection`,
          bindVars: { '@collection': COLL_CATEGORIES, key },
        }),
      );
      await trx.commit();
      return { key };
    } catch (err) {
      await trx.abort();
      throw err;
    }
  });

/**
 * Move a category under a new parent (or to the root when `newParentKey` is
 * null): remove any existing incoming edge, then insert the new one. The
 * cycle/no-op/existence checks are done by the caller.
 */
const moveCategory = (key, newParentKey) =>
  withErrorHandling(async () => {
    const trx = await db.beginTransaction({ write: [COLL_HAS_SUBCATEGORY] });
    try {
      await trx.step(() =>
        db.query({
          query: `FOR e IN @@collection FILTER e._to == @to REMOVE e IN @@collection`,
          bindVars: {
            '@collection': COLL_HAS_SUBCATEGORY,
            to: `${COLL_CATEGORIES}/${key}`,
          },
        }),
      );
      if (newParentKey) {
        await trx.step(() =>
          db.query({
            query: `INSERT { _from: @from, _to: @to } IN @@collection`,
            bindVars: {
              '@collection': COLL_HAS_SUBCATEGORY,
              from: `${COLL_CATEGORIES}/${newParentKey}`,
              to: `${COLL_CATEGORIES}/${key}`,
            },
          }),
        );
      }
      await trx.commit();
      return { key, parentKey: newParentKey || null };
    } catch (err) {
      await trx.abort();
      throw err;
    }
  });

module.exports = {
  addCategory,
  createCategory,
  createEdge,
  deleteCategory,
  getAllCategories,
  getCategoriesByName,
  getCategoryByKey,
  getChildrenCount,
  getDescendantKeys,
  getExpandableCategories,
  getEdgeByKey,
  getIncomingEdges,
  getNotesCount,
  getOutcomingEdges,
  getPaths,
  getPathsFlattened,
  getTree,
  moveCategory,
  renameCategory,
  updateEdge,
};
