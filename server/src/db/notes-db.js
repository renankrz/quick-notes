const { db, withErrorHandling } = require('./common');

const { COLL_NOTES, GRAPH_CATEGORIES } = require('../constants');

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

module.exports = {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteByKey,
  updateNote,
};
