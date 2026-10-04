const { Router } = require('express');
const {
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
} = require('../db/categories-tree-db');
const { HttpError } = require('../http-error');

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

// ----------------------------------------------------------------------------
// Category management (RESTful)
// ----------------------------------------------------------------------------

// Add a category. Body: { name, parentKey? }. Omit parentKey to create a root.
router.post('/categories', async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const { parentKey = null } = req.body;
    if (!name) {
      throw new HttpError(400, 'A non-empty "name" is required');
    }
    if (parentKey) {
      const parent = await getCategoryByKey(parentKey);
      if (!parent.length) {
        throw new HttpError(
          404,
          'The specified parent category does not exist',
        );
      }
      const siblings = await getOutcomingEdges(parentKey);
      if (siblings.some((e) => e.to.name === name)) {
        throw new HttpError(
          409,
          'A sibling category with that name already exists',
        );
      }
    }
    const category = await addCategory(name, parentKey);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// Rename a category. Body: { name }.
router.patch('/categories/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!name) {
      throw new HttpError(400, 'A non-empty "name" is required');
    }
    const existing = await getCategoryByKey(key);
    if (!existing.length) {
      throw new HttpError(404, 'Category not found');
    }
    const category = await renameCategory(key, name);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Move a category under a new parent (or to the root). Body: { newParentKey|null }.
router.patch('/categories/:key/parent', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { newParentKey = null } = req.body;
    const existing = await getCategoryByKey(key);
    if (!existing.length) {
      throw new HttpError(404, 'Category not found');
    }
    if (newParentKey) {
      if (newParentKey === key) {
        throw new HttpError(400, 'A category cannot be its own parent');
      }
      const parent = await getCategoryByKey(newParentKey);
      if (!parent.length) {
        throw new HttpError(
          404,
          'The specified parent category does not exist',
        );
      }
      const descendantKeys = await getDescendantKeys(key);
      if (descendantKeys.includes(newParentKey)) {
        throw new HttpError(
          400,
          'A category cannot be moved under one of its own descendants',
        );
      }
    }
    const result = await moveCategory(key, newParentKey);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Delete a category. Allowed only when it has no notes and no subcategories.
router.delete('/categories/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const existing = await getCategoryByKey(key);
    if (!existing.length) {
      throw new HttpError(404, 'Category not found');
    }
    const [notesCount, childrenCount] = await Promise.all([
      getNotesCount(key),
      getChildrenCount(key),
    ]);
    if (notesCount > 0) {
      throw new HttpError(409, 'Cannot delete a category that still has notes');
    }
    if (childrenCount > 0) {
      throw new HttpError(
        409,
        'Cannot delete a category that still has subcategories',
      );
    }
    const result = await deleteCategory(key);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
