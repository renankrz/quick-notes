/**
 * Idempotent database setup: ensures the collections, the named graph and the
 * indexes the application relies on exist. Safe to run repeatedly.
 *
 * Usage: `yarn db:setup`
 */
/* eslint-disable no-console */
const { db } = require('./common');
const {
  COLL_CATEGORIES,
  COLL_NOTES,
  COLL_HAS_SUBCATEGORY,
  GRAPH_CATEGORIES,
} = require('../constants');

const ensureDocumentCollection = async (name) => {
  const coll = db.collection(name);
  if (!(await coll.exists())) {
    await coll.create();
    console.log(`Created document collection "${name}".`);
  }
};

const ensureEdgeCollection = async (name) => {
  const coll = db.collection(name);
  if (!(await coll.exists())) {
    await coll.create({ type: 3 /* edge */ });
    console.log(`Created edge collection "${name}".`);
  }
};

const ensureGraph = async () => {
  const graph = db.graph(GRAPH_CATEGORIES);
  if (!(await graph.exists())) {
    await graph.create([
      {
        collection: COLL_HAS_SUBCATEGORY,
        from: [COLL_CATEGORIES],
        to: [COLL_CATEGORIES],
      },
    ]);
    console.log(`Created graph "${GRAPH_CATEGORIES}".`);
  }
};

const ensureIndexes = async () => {
  // Every notes query filters by categoryKey; back it with a persistent index.
  await db.collection(COLL_NOTES).ensureIndex({
    type: 'persistent',
    fields: ['categoryKey'],
    name: 'idx_notes_categoryKey',
  });
  console.log('Ensured index idx_notes_categoryKey on notes.categoryKey.');
};

const main = async () => {
  await ensureDocumentCollection(COLL_CATEGORIES);
  await ensureDocumentCollection(COLL_NOTES);
  await ensureEdgeCollection(COLL_HAS_SUBCATEGORY);
  await ensureGraph();
  await ensureIndexes();
  console.log('Database setup complete.');
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
