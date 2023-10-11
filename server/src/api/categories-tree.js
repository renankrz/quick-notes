const { Router } = require('express');
const {
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
} = require('../db/categories-tree-db');

const router = Router();

router.get('/', async (req, res, next) => {
  const sort = (nodes) => {
    // eslint-disable-next-line no-param-reassign
    nodes =
      nodes.length > 0
        ? nodes.sort((a, b) => {
            const nameA = a.name
              .toUpperCase()
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '');
            const nameB = b.name
              .toUpperCase()
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '');
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          })
        : [];
    nodes.forEach((node) => {
      sort(node.children);
    });
  };
  try {
    const tree = await getTree();
    sort(tree);
    res.json(tree);
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  const { expandable } = req.query;
  try {
    let vertices;
    if (expandable === 'true') {
      vertices = await getExpandableCategories();
    } else if (expandable === undefined) {
      vertices = await getAllCategories();
    } else if (expandable === 'false') {
      const expandableVerticesKeys = (await getExpandableCategories()).map(
        (v) => v.key,
      );
      vertices = (await getAllCategories()).filter(
        (v) => !expandableVerticesKeys.includes(v.key),
      );
    } else {
      res.status(400);
      res.send('"expandable" should be either "true" or "false"');
      return;
    }
    res.json(vertices);
  } catch (error) {
    next(error);
  }
});

router.get('/categories/key/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const vertex = await getCategoryByKey(key);
    if (!vertex.length) {
      res.status(404);
      res.send('Category not found');
      return;
    }
    res.json(vertex);
  } catch (error) {
    next(error);
  }
});

router.get('/categories/name/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const vertices = await getCategoriesByName(name);
    if (!vertices.length) {
      res.status(404);
      res.send('Category not found');
      return;
    }
    res.json(vertices);
  } catch (error) {
    next(error);
  }
});

router.post('/categories/:parentKey/:name', async (req, res, next) => {
  const { parentKey, name } = req.params;
  try {
    const parent = await getCategoryByKey(parentKey);
    if (!parent.length) {
      res.status(400);
      res.send('The specified parent category does not exist');
      return;
    }
    const child = await createCategory(name);
    await createEdge(parentKey, child.key);
    res.json(child);
  } catch (error) {
    next(error);
  }
});

router.get('/edges/key/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const edge = await getEdgeByKey(key);
    if (!edge.length) {
      res.status(404);
      res.send('Edge not found');
      return;
    }
    res.json(edge);
  } catch (error) {
    next(error);
  }
});

router.get('/edges/vertex/:key', async (req, res, next) => {
  const { key } = req.params;
  const { direction } = req.query;
  try {
    const vertex = await getCategoryByKey(key);
    if (!vertex.length) {
      res.status(400);
      res.send('The specified category does not exist');
      return;
    }
    let edges = [];
    if (direction === 'in') {
      edges = await getIncomingEdges(key);
    } else if (direction === 'out') {
      edges = await getOutcomingEdges(key);
    } else if (direction === 'both' || direction === undefined) {
      edges = (await getIncomingEdges(key)).concat(
        await getOutcomingEdges(key),
      );
    } else {
      res.status(400);
      res.send('"direction" should be either "in", "out" or "both"');
      return;
    }
    res.json(edges);
  } catch (error) {
    next(error);
  }
});

router.put('/edges/:key', async (req, res, next) => {
  const { key } = req.params;
  const { from, to } = req.body;
  try {
    const edge = await getEdgeByKey(key);
    if (!edge.length) {
      res.status(404);
      res.send('Edge not found');
      return;
    }
    const vertexFrom = await getCategoryByKey(from);
    if (!vertexFrom.length) {
      res.status(400);
      res.send('The category specified as "from" does not exist');
      return;
    }
    const vertexTo = await getCategoryByKey(to);
    if (!vertexTo.length) {
      res.status(400);
      res.send('The category specified as "to" does not exist');
      return;
    }
    const updatedEdge = await updateEdge(key, from, to);
    res.json(updatedEdge);
  } catch (error) {
    next(error);
  }
});

router.get('/paths/', async (req, res, next) => {
  const { flattened } = req.query;
  try {
    let vertices;
    if (flattened === 'true') {
      vertices = await getPathsFlattened();
    } else if (flattened === 'false' || flattened === undefined) {
      vertices = await getPaths();
    } else {
      res.status(400);
      res.send('"flattened" should be either "true" or "false"');
      return;
    }
    res.json(vertices);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
