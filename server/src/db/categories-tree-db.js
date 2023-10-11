const { db, withErrorHandling } = require('./common');

const {
  COLL_CATEGORIES,
  COLL_HAS_SUBCATEGORY,
  GRAPH_CATEGORIES,
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
    const vertex = await cursor.all();
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
    const edge = await cursor.all();
    return {
      key: edge._key,
      from: edge._from.split('/')[1],
      to: edge._to.split('/')[1],
    };
  });

module.exports = {
  createCategory,
  createEdge,
  getAllCategories,
  getCategoriesByName,
  getCategoryByKey,
  getExpandableCategories,
  getEdgeByKey,
  getIncomingEdges,
  getOutcomingEdges,
  getPaths,
  getPathsFlattened,
  getTree,
  updateEdge,
};
