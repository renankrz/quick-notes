# Software Quality Report

Scope: `server/src/**` and `client/src/**` as of the `modernization` branch start.
Legend: ✅ fixed in this pass · 🔸 documented, deferred.

## General aspect

The code is small, readable and consistently formatted (prettier + airbnb). The data model is
clean: `categories` vertices, `hasSubcategory` edges, a named graph, and `notes` documents
carrying a `categoryKey`. The DB layer is a thin set of AQL helpers, and the API is a flat set
of Express routers. The client uses React Query for server state and MUI for UI.

Main structural weaknesses:

- **Derived state is fetched, not derived.** The client issues four category queries (tree,
  expandable, selectable, flattened paths) that are all functions of one tree. Three of them
  could be computed on the client from the tree.
- **Non-reactive refs.** `expandableNodes`/`selectableNodes` live in `useRef` and are filled in
  `onSuccess`, so "expand all"/"select all" can read stale/empty values and the component does
  not re-render when they change.
- **The REST surface is inconsistent.** Paths like `POST /categories/:parentKey/:name` put the
  payload in the URL, and there is edge-level CRUD exposed (`/edges/...`) that leaks the storage
  model to the client.
- **No validation, no auth, no tests, no CI, no types.**

## Evident bugs

1. ✅ **`createCategory` returns `undefined` fields.** `cursor.all()` returns an array, but the
   code reads `vertex._key`/`vertex.name` off the array, yielding `{ key: undefined, name: undefined }`.
   The follow-up `createEdge(parentKey, child.key)` then inserts an edge whose `_to` is
   `categories/undefined`. Fixed by reading the first element.
2. ✅ **`index.js` crashes without env vars.** `process.env.ALLOWED_ORIGINS.split(...)` throws a
   `TypeError` at startup if the variable is unset. Added validation + a safe parse.
3. ✅ **Missing error-handling + 404 middleware.** Routers call `next(error)` but there is no error
   middleware, so Express falls back to its default HTML handler. Added JSON `{ error }` handler.
4. ✅ **React Query v4 invalidation form.** `queryClient.invalidateQueries('notes')` uses the v3
   string argument; in v4 it should be `invalidateQueries({ queryKey: ['notes'] })`. Also the
   create/update flows invalidate `notes` but not the category-derived caches.
5. ✅ **`prop-types` used but not declared.** The client imports `prop-types` in several
   components but does not list it in `client/package.json`; it resolves only transitively.
6. 🔸 **Full-collection scans for key lookups.** `getCategoryByKey`/`getNoteByKey` do
   `FOR x IN coll FILTER x._key == @key`, a full scan where `DOCUMENT(coll, key)` is O(1).
7. 🔸 **`updateEdge` return shape.** It reads `edge._key`/`edge._from` from a cursor array, same
   class of bug as #1 (returns `undefined`s). Superseded by the new move endpoint in Phase 3.
8. 🔸 **Unvalidated `rank`.** `parseInt(data.rank, 10)` yields `NaN` for bad input and is stored.

## Pitfalls

- 🔸 **XSS.** Notes are rendered with `rehype-raw` (raw HTML passthrough). Safe only under a
  strict single-user assumption. If notes are ever shared/synced, add `rehype-sanitize` with a
  KaTeX/highlight-aware schema.
- 🔸 **No referential integrity.** Deleting a category could orphan its notes and leave dangling
  edges. Phase 3 adds the "no notes / no children" delete rule and transactional edge cleanup.
- 🔸 **Cycle risk.** Traversals use a hard-coded depth `0..99`. Once categories can be moved,
  a cycle would be possible; the new move endpoint rejects moving a node under its own descendant.
- 🔸 **Missing index.** `notes.categoryKey` should have a persistent index (used by every notes
  query). Added a `db:setup` script.
- 🔸 **No optimistic updates / error surfaces.** Failed mutations are only `console.error`-ed.
- 🔸 **`.env` is gitignored (good)** — verified `*.env` in `.gitignore`. No secrets committed.

## Resolved vs. remaining

| # | Item | Status |
|---|------|--------|
| 1 | createCategory array bug | ✅ fixed |
| 2 | env validation at startup | ✅ fixed |
| 3 | error + 404 middleware | ✅ fixed |
| 4 | RQ v4 invalidation form | ✅ fixed |
| 5 | prop-types dependency | ✅ fixed |
| 6 | key-lookup scans | 🔸 Phase 2 |
| 7 | updateEdge shape | 🔸 replaced in Phase 3 |
| 8 | rank validation | 🔸 Phase 2 |
| — | XSS sanitization | 🔸 Phase 1 pitfall / Phase 5 optional |
| — | notes.categoryKey index | ✅ db:setup script added |
