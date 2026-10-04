const { db, withErrorHandling } = require('./common');

const {
  COLL_NOTES,
  GRAPH_CATEGORIES,
  MAX_TREE_DEPTH,
} = require('../constants');

const createNote = async (data) =>
  withErrorHandling(async () => {
    const query = `
      INSERT @data INTO @@collection
      RETURN NEW
    `;
    const bindVars = {
      '@collection': COLL_NOTES,
      data: {
        ...data,
        rank: parseInt(data.rank, 10),
      },
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const result = await cursor.all();
    return result;
  });

const deleteNote = async (key) =>
  withErrorHandling(async () => {
    const query = `
      REMOVE @key IN @@collection
      RETURN OLD
    `;
    const bindVars = {
      '@collection': COLL_NOTES,
      key,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const result = await cursor.all();
    return result;
  });

const getAllNotes = async (categoriesKeys) =>
  withErrorHandling(async () => {
    const query = `
      LET subtreeCategoriesKeys = (
        FOR startVertex IN @categoriesIds
        FOR v
        IN 0..99
        OUTBOUND startVertex
        GRAPH @graph
        RETURN DISTINCT v._key
      )
      FOR n IN @@collection
      FILTER n.categoryKey IN subtreeCategoriesKeys
      SORT n.rank
      RETURN {
        categoryKey: n.categoryKey,
        content: n.content,
        key: n._key,
        rank: n.rank,
        title: n.title,
      }
    `;
    const bindVars = {
      '@collection': COLL_NOTES,
      graph: GRAPH_CATEGORIES,
      categoriesIds: categoriesKeys.map((k) => `categories/${k}`),
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const result = await cursor.all();
    return result;
  });

const getNoteByKey = async (key) =>
  withErrorHandling(async () => {
    const query = `
      FOR n IN @@collection
      FILTER n._key == @key
      RETURN n
    `;
    const bindVars = {
      '@collection': COLL_NOTES,
      key,
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const result = await cursor.all();
    return result;
  });

const updateNote = async (key, data) =>
  withErrorHandling(async () => {
    const query = `
      UPDATE @key WITH @data IN @@collection
      RETURN NEW
    `;
    const bindVars = {
      '@collection': COLL_NOTES,
      key,
      data: {
        ...data,
        rank: parseInt(data.rank, 10),
      },
    };
    const cursor = await db.query({
      query,
      bindVars,
    });
    const result = await cursor.all();
    return result;
  });

/**
 * Keys of a category plus, optionally, all its descendants.
 */
const resolveCategoryKeys = (categoryKey, includeDescendants) =>
  withErrorHandling(async () => {
    if (!includeDescendants) {
      return [categoryKey];
    }
    const query = `
      FOR v IN 0..@maxDepth OUTBOUND @startId GRAPH @graph
      RETURN DISTINCT v._key
    `;
    const bindVars = {
      maxDepth: MAX_TREE_DEPTH,
      graph: GRAPH_CATEGORIES,
      startId: `categories/${categoryKey}`,
    };
    const cursor = await db.query({ query, bindVars });
    return cursor.all();
  });

/**
 * Count notes in a category (optionally including descendant categories).
 */
const countNotes = async (categoryKey, includeDescendants = false) =>
  withErrorHandling(async () => {
    const keys = await resolveCategoryKeys(categoryKey, includeDescendants);
    const query = `
      RETURN LENGTH(
        FOR n IN @@collection
        FILTER n.categoryKey IN @keys
        RETURN 1
      )
    `;
    const cursor = await db.query({
      query,
      bindVars: { '@collection': COLL_NOTES, keys },
    });
    const [count] = await cursor.all();
    return count;
  });

/**
 * Move a single note to another category.
 */
const moveNote = async (key, categoryKey) =>
  withErrorHandling(async () => {
    const query = `
      UPDATE @key WITH { categoryKey: @categoryKey } IN @@collection
      RETURN NEW
    `;
    const bindVars = { '@collection': COLL_NOTES, key, categoryKey };
    const cursor = await db.query({ query, bindVars });
    const [note] = await cursor.all();
    return note;
  });

/**
 * Move every note from one category (optionally its subtree) to another.
 * Returns the number of notes moved.
 */
const moveAllNotes = async (
  fromCategoryKey,
  toCategoryKey,
  includeDescendants = false,
) =>
  withErrorHandling(async () => {
    const keys = await resolveCategoryKeys(fromCategoryKey, includeDescendants);
    const query = `
      LET moved = (
        FOR n IN @@collection
        FILTER n.categoryKey IN @keys
        UPDATE n WITH { categoryKey: @toCategoryKey } IN @@collection
        RETURN 1
      )
      RETURN LENGTH(moved)
    `;
    const cursor = await db.query({
      query,
      bindVars: { '@collection': COLL_NOTES, keys, toCategoryKey },
    });
    const [moved] = await cursor.all();
    return moved;
  });

/**
 * Delete every note from a category (optionally its subtree).
 * Returns the number of notes deleted.
 */
const deleteAllNotes = async (categoryKey, includeDescendants = false) =>
  withErrorHandling(async () => {
    const keys = await resolveCategoryKeys(categoryKey, includeDescendants);
    const query = `
      LET removed = (
        FOR n IN @@collection
        FILTER n.categoryKey IN @keys
        REMOVE n IN @@collection
        RETURN 1
      )
      RETURN LENGTH(removed)
    `;
    const cursor = await db.query({
      query,
      bindVars: { '@collection': COLL_NOTES, keys },
    });
    const [deleted] = await cursor.all();
    return deleted;
  });

module.exports = {
  countNotes,
  createNote,
  deleteAllNotes,
  deleteNote,
  getAllNotes,
  getNoteByKey,
  moveAllNotes,
  moveNote,
  updateNote,
};
