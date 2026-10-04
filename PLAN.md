# Quick Notes – Execution Plan

Audience: an AI coding agent (e.g. Claude Opus in VS Code). Execute phases in order. Each phase ends with a verification step and a commit. Do not start a phase before the previous one is verified.

## Repo facts (verified)

- `server/`: Express 4 + `arangojs` 8, CommonJS, yarn, ESLint 8 + airbnb-base + prettier. Files: `src/index.js`, `src/api/{categories-tree,notes}.js`, `src/db/{common,categories-tree-db,notes-db}.js`, `src/constants.js`.
- `client/`: Vite 4 + React 18, MUI 5, `@mui/x-tree-view` 6 alpha (`TreeView`, `onNodeSelect`, `multiSelect`), `@tanstack/react-query` 4, `react-markdown` 8, `react-hook-form`. State lives in `App.jsx`.
- DB: ArangoDB. Collections: `categories` (vertices), `hasSubcategory` (edges), `notes` (docs with `categoryKey`, `rank`, `title`, `content`). Graph name in `GRAPH_CATEGORIES`.
- `dump.sh` / `restore.sh` + `dump/` are used for backups. Take a dump before any DB-touching work.

## Dependency graph between tasks

```
Phase 0 (baseline) -> Phase 1 (audit/fixes) -> Phase 2 (upgrades)
                                             -> Phase 3 (backend features)
Phase 3 + Phase 4 (tree library decision) -> Phase 5 (UI for features) -> Phase 6 (polish/docs)
```

Reason: the tree component choice depends on the features (add/remove/move, drag and drop, context menus, multi-select for bulk note actions). Upgrades come before the UI rewrite so the UI is written once against the new versions.

---

## Phase 0 – Baseline

1. Run `./dump.sh` and keep the output untouched.
2. `cd server && yarn && yarn lint`; `cd client && yarn && yarn lint && yarn build`. Record which commands pass or fail.
3. Create branch `modernization`.
4. Add a minimal test setup for the server (Vitest or `node:test`) to cover the db layer against a throwaway Arango database (env var `ARANGO_DB_TEST`). Needed for Phases 1 and 3.

Verify: baseline results recorded in `docs/baseline.md`.

---

## Phase 1 – Software quality audit and bug fixes

Produce `docs/quality-report.md` with three sections: **General aspect**, **Evident bugs**, **Pitfalls**. Read every file in `server/src` and `client/src` before writing. Seed list below; confirm each item and add others found.

### Known or suspected bugs (confirm, then fix)

- `server/src/db/categories-tree-db.js` `createCategory`: `cursor.all()` returns an **array**, but the code reads `vertex._key` and `vertex.name` from it, so it returns `undefined` fields. Use `cursor.next()` or `[vertex]`.
- `getCategoryByKey` uses a full scan (`FOR v ... FILTER v._key`) where `DOCUMENT()` or a key lookup is enough. Same in `getNoteByKey`.
- `createNote` / `updateNote` run `parseInt(data.rank, 10)` without validation (NaN becomes null). `updateNote` on a missing key throws and is not mapped to a 404.
- `server/src/index.js`: `process.env.ALLOWED_ORIGINS.split` throws if the env var is missing. CORS origin is hard-coded to `http://`. No 404 or error-handling middleware, no input validation, and the 1mb body limit is the only guard.
- `getAllNotes`: traversal depth `0..99` is arbitrary. If the graph has cycles, `DISTINCT` hides them but cost grows. Nothing prevents cycles today. Moving categories (Phase 3) will make this real.
- `client`: `PropTypes` is imported but `prop-types` is not in `client/package.json` (works only transitively). Check `queryClient.invalidateQueries('notes')`, which uses the v3 string form. In v4 it should be `{ queryKey: ['notes'] }`.
- `client/src/components/App.jsx`: derived state is stored in `useRef` and set in `onSuccess` (expandable and selectable nodes). It is not reactive and is fragile. `rand` is stored in state. Four separate queries could be derived from one tree query.
- Check the client API files for hard-coded URLs (should use `import.meta.env.VITE_API_URL`).
- Check `dump/` for secrets. Check whether `.env` files are gitignored.

### Pitfalls to evaluate

- No authentication. Anyone who can reach the API can delete notes.
- No tests, no CI, no TypeScript or JSDoc types.
- Notes content is rendered with `rehype-raw` (raw HTML). This is an **XSS risk** if notes can come from anywhere other than the owner. Add `rehype-sanitize` with a KaTeX- and highlight-compatible schema, or document the single-user assumption.
- Delete has no confirmation. No optimistic updates or error UI for failed mutations.
- Edges and notes have no referential integrity (deleting a category could orphan notes, which is the exact rule needed in Phase 3).
- Indexes: `notes.categoryKey` needs a persistent index.

### Fixes

Fix only clear bugs here (createCategory, invalidateQueries form, prop-types, env validation, error middleware with consistent JSON `{ error: string }`). Add an index on `notes.categoryKey` in a db setup script. Add server tests for each fix.

Verify: tests, lint and build pass. Commit.

---

## Phase 2 – Tech stack upgrade

Do one bump per commit; run lint, build and tests after each. Use `yarn upgrade-interactive --latest` or `npx npm-check-updates` to list targets (do not trust the versions below, check the registry).

Server:
1. Node: set `engines` and `.nvmrc` to the current LTS.
2. `arangojs` 8 -> latest 9.x (check the migration guide; the cursor and `db.query` API is mostly stable).
3. `express` 4 -> 5 (async errors are forwarded automatically, so remove try/catch wrappers where possible). `eslint` 8 -> 9 (flat config `eslint.config.js`), `eslint-config-airbnb-base` is unmaintained, so replace it with `@eslint/js` + `eslint-plugin-import` or `neostandard`. Update `prettier`, `nodemon` (or use `node --watch`).
4. `dotenv`: or use `node --env-file`.

Client:
1. `vite` 4 -> latest, `@vitejs/plugin-react`.
2. `react` / `react-dom` 18 -> 19, `@types/react`.
3. `@mui/material`, `@mui/icons-material`, `@mui/system` 5 -> latest (v6/v7). **`@mui/x-tree-view` 6 alpha -> latest stable (v7/v8)**, where `TreeView` is renamed `SimpleTreeView` / `RichTreeView` and `nodeId` is renamed `itemId`. Do this step even if Phase 4 replaces it, unless Phase 4 decides to drop it (then skip).
4. `@tanstack/react-query` 4 -> 5 (`useQuery({ queryKey, queryFn })` object syntax only; `useMutation` likewise; `onSuccess` removed from `useQuery`, which fits the Phase 1 refactor).
5. `react-markdown` 8 -> latest, plus `remark-math`, `rehype-katex`, `rehype-raw`. Check `react-syntax-highlighter` (replace with `react-shiki` or `shiki` if the Prism/hljs build is problematic).
6. `eslint` 8 -> 9 flat config, and `react-hooks`/`react-refresh` plugins updated.

Verify: manual smoke test (list notes, create, edit, delete, markdown+LaTeX+code render). Commit `chore: upgrade`.

---

## Phase 3 – Backend features (before the UI)

Design the API first, write it in `server/src/api/*` and `server/src/db/*`, add tests. All multi-step writes **must use a single ArangoDB stream transaction** (`db.beginTransaction` with `write: [categories, hasSubcategory, notes]`) or a single AQL with multiple statements, so partial failures cannot corrupt the tree.

### Categories

| Feature | Endpoint | Rules |
|---|---|---|
| Add | `POST /api/categories-tree` body `{ name, parentKey? }` | Create vertex; create edge if `parentKey` is given (root otherwise). Trim and require a non-empty name. Decide whether sibling names must be unique (recommended: yes, 409 on duplicate). Return `{ key, name }`. |
| Remove | `DELETE /api/categories-tree/:key` | Allowed only if the category has **no notes** (409 with message otherwise). Decide for children: recommended **also reject if it has subcategories** (409) to keep the rule simple; mention this in the UI. Remove its incoming edge in the same transaction. |
| Move | `PATCH /api/categories-tree/:key/parent` body `{ newParentKey \| null }` | Remove the existing incoming edge, insert the new one (or none for root). **Reject cycles**: `newParentKey` must not be the category itself or any of its descendants (AQL `OUTBOUND` traversal from `key`). Reject no-ops. 404 for unknown keys. |
| Rename (optional, cheap) | `PATCH /api/categories-tree/:key` body `{ name }` | |

Also check the existing `GET` shapes used by the client (tree, expandable, selectable, flattened paths). Keep them stable, or replace them with one `GET /tree` and derive the rest on the client (preferred, see Phase 5).

Constraint: a category has at most one parent (tree, not DAG). Enforce it on the server via the move transaction. Verify the current data satisfies this.

### Notes

| Feature | Endpoint | Rules |
|---|---|---|
| Move one | `PATCH /api/notes/:key/category` body `{ categoryKey }` | Target must exist. Rank: append at the end of the target category, or keep the rank (decide: keep). |
| Move all | `POST /api/notes/move` body `{ fromCategoryKey, toCategoryKey, includeDescendants?: false }` | One AQL `FOR n IN notes FILTER ... UPDATE`. Return `{ moved: number }`. Reject if from == to. |
| Delete all | `DELETE /api/notes?categoryKey=...&includeDescendants=false` | Return `{ deleted: number }`. |
| Count (for confirmations) | `GET /api/notes/count?categoryKey=...` | UI shows "Move N notes?" before confirming. |

Confirmation is a UI responsibility, but the server should require an explicit `confirm: true` flag for the bulk delete and bulk move, to protect against accidental calls.

Tests: cycle rejection, delete blocked by notes, delete blocked by children, move to root, move all counts, transaction rollback on failure.

Verify: tests pass; exercise the endpoints with `curl`. Commit per feature.

---

## Phase 4 – Tree component decision (look 'n' feel)

Requirements derived from the features and the existing app:

1. Arbitrary depth, hundreds of nodes.
2. Multi-select (the notes view shows notes for all selected subtrees) with expand/collapse all.
3. Per-node actions: add child, rename, delete, move.
4. **Move via drag and drop** (plus a keyboard/menu fallback, "Move to..." dialog).
5. Keyboard accessibility, theming consistent with MUI.
6. Optional: search/filter by name, since the app already has a flattened-paths API.

Candidates to evaluate (write a short comparison table in `docs/tree-decision.md`, then pick one; spend max ~1 hour):

- **`@mui/x-tree-view` latest (`RichTreeView`)**: same ecosystem. Newer versions support multi-select, checkbox selection, lazy loading, and drag-and-drop reordering only in the **Pro** package (`RichTreeViewPro`, `itemsReordering`, paid/commercial). Free version: use a custom move dialog.
- **`react-arborist`**: MIT, virtualized, built-in drag and drop, rename inline, multi-select, keyboard support, create/delete/move callbacks (`onCreate`, `onDelete`, `onMove`, `onRename`). Maps almost 1:1 to the required features.
- **`@headless-tree/react`** (successor of `@headless-tree/core`): headless, flexible, DnD, multi-select, search; more wiring needed.
- **`react-complex-tree`**: mature, DnD, multi-select, but less actively maintained.

Default recommendation (unless the evaluation disagrees): **`react-arborist`** for DnD + inline rename + multi-select, styled with MUI-compatible CSS variables. Fallback: `RichTreeView` free + "Move to..." dialog.

Prototype check on the chosen library (a throwaway page): 50-node tree, multi-select, drag one node under another, rename, delete. Record the result.

Output: decision recorded and the dependency added (and `@mui/x-tree-view` removed if not used).

---

## Phase 5 – Client implementation

Prereqs: Phases 2, 3, 4 done.

1. **Data layer refactor** (`client/src/api/*`): a single `useCategoriesTree` hook (query key `['categories-tree']`) returning the tree; derive expandable, selectable and flattened-path structures with `useMemo` instead of 3 extra queries + refs. Remove the `useRef` + `onSuccess` pattern. Add API functions: `createCategory`, `deleteCategory`, `moveCategory`, `renameCategory`, `moveNote`, `moveAllNotes`, `deleteAllNotes`, `countNotes`. Use `VITE_API_URL`.
2. **State**: extract a small `useTreeSelection` hook (expanded, selected, expand-all/select-all) out of `App.jsx`. Keep `App.jsx` thin.
3. **Tree component**: rewrite `CategoriesTree.jsx` (and `CustomTreeItem.jsx`) for the chosen library. Context menu (or row buttons on hover) with: *Add subcategory*, *Rename*, *Move to...*, *Delete*, *Move all notes to...*, *Delete all notes*. A root-level "Add category" button above the tree.
4. **Dialogs** (new `components/dialogs/`): `ConfirmDialog` (shows count from `countNotes`, e.g. "Delete 12 notes from X?"), `CategoryNameDialog`, `CategoryPickerDialog` (reuses the tree in single-select mode; disables the node itself and its descendants when moving a category).
5. **Notes**: add a "Move to category" action on each note card (opens `CategoryPickerDialog`). Update `Form.jsx` so a category change in edit mode also works through the same path.
6. **Errors**: show server `{ error }` messages in a MUI `Snackbar`. Delete-blocked (409) errors must explain why ("has notes" / "has subcategories").
7. **Cache invalidation**: after any category/notes mutation, invalidate `['categories-tree']` and `['notes']`. Drop selected keys that no longer exist.
8. **Optional**: category search/filter; XSS sanitization from Phase 1 if not done.

Verify manually with this checklist: add root; add child; rename; move to another parent; move to root; attempt move into own descendant (blocked); delete with notes (blocked, message shown); delete empty (ok); move one note; move all notes (confirm shown with count); delete all notes (confirm shown with count); refresh the page and confirm persistence. Add component tests (Vitest + Testing Library) for the dialogs and the tree callbacks if time permits.

---

## Phase 6 – Wrap-up

- Update `README.md`: setup, env vars (`API_PORT`, `CLIENT_PORT`, `ALLOWED_ORIGINS`, `VITE_API_URL`, Arango credentials), feature list, backup/restore.
- Add a GitHub Actions workflow: install, lint, test, build for both packages.
- Re-run `./dump.sh` to verify backup and restore still work with the new data.
- Finalize `docs/quality-report.md` with a "resolved vs. remaining" column.

## Agent working rules

- Read the file before editing it. Make small commits (Conventional Commits).
- After each edit run lint (`yarn lint`) and the relevant tests. Never leave the build broken between commits.
- Never run destructive DB commands against the real database; use the test database. Run `./dump.sh` before manual testing of delete/move.
- When a decision is marked "decide", choose the recommended option, and note it in `docs/decisions.md`.
- Do not add dependencies not named in this plan without recording why.
