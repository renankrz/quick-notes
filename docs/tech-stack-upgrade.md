# Tech Stack Upgrade Runbook (Phase 2)

> **Status: APPLIED (2026-10-04) on Node 24.21.0.** All upgrades below were
> performed on the `modernization` branch. Both packages lint clean and the
> client builds; the server boots and its endpoints + transactions were
> verified against a live ArangoDB. Actual versions installed:
>
> - **Node:** pinned `>=24` (`engines` + `.nvmrc`).
> - **Server:** arangojs 10, express 5, cors 2.8.6, morgan 1.12; ESLint 9 flat
>   config (airbnb-base removed, replaced with `@eslint/js` + `eslint-plugin-import`
>   + `simple-import-sort` + prettier); prettier/nodemon bumped. `dotenv` kept at
>   16 (v17+ only adds a startup banner).
> - **Client:** React 19, Vite 8, `@vitejs/plugin-react` 6, MUI 9,
>   `@mui/x-tree-view` 9 (`SimpleTreeView`), `@tanstack/react-query` 5,
>   react-markdown 10, react-syntax-highlighter 16, ESLint 9 flat config.
>
> The sections below are retained as the reference for *how* it was done.

This machine runs **Node v14**, which is too old to install/build the target versions, and no
ArangoDB is reachable, so the upgrades below are **not applied automatically**. Follow this
runbook on a machine with a current Node LTS and a running ArangoDB. Do **one bump per commit**
and run `yarn lint` / `yarn build` / tests after each.

## 0. Prerequisites

```bash
# Install and use a current LTS, then pin it
nvm install --lts && nvm use --lts
node -v   # expect >= 20
```

Add to `server/package.json` and `client/package.json`:

```json
"engines": { "node": ">=20" }
```

Add `.nvmrc` (repo root) containing the LTS major, e.g. `20`.

List the actual latest versions (do not trust hand-written numbers):

```bash
cd server && npx npm-check-updates
cd ../client && npx npm-check-updates
```

## 1. Server

| Package | From | Action / notes |
|---|---|---|
| `arangojs` | ^8.4 | -> latest 9.x. `db.query`, cursors and `beginTransaction` used here are stable across 8→9; re-run db tests. |
| `express` | ^4.18 | -> 5.x. Async errors now propagate to the error middleware automatically; the per-route try/catch can be removed gradually. Keep the central error handler added in `index.js`. |
| `eslint` + `eslint-config-airbnb-base` | 8 / 15 | airbnb-base is unmaintained for flat config. Move to **flat config** (`eslint.config.js`) with `@eslint/js` + `eslint-plugin-import` (+ `eslint-config-prettier`), or switch to `neostandard`. |
| `prettier`, `nodemon` | 3 / 3 | bump; optionally drop `nodemon` for `node --watch`. |
| `dotenv` | ^16 | optional: replace with `node --env-file=.env`. |

After upgrading, run the new setup script once: `yarn db:setup`.

## 2. Client

| Package | From | Action / notes |
|---|---|---|
| `vite`, `@vitejs/plugin-react` | ^4 | -> latest. |
| `react`, `react-dom` | ^18 | -> 19. Check `@types/react`. |
| `@mui/material`, `@mui/icons-material`, `@mui/system` | ^5.14 | -> latest (v6/v7). Review the codemods (`npx @mui/codemod@latest`). |
| `@mui/x-tree-view` | 6.0.0-alpha | See `docs/tree-decision.md`. If kept: -> stable v7/v8, where `TreeView`→`SimpleTreeView`, `TreeItem`'s `nodeId`→`itemId`, `onNodeToggle`/`onNodeSelect`→`onExpandedItemsChange`/`onSelectedItemsChange`. **`CategoriesTree.jsx` and `CustomTreeItem.jsx` must be updated accordingly.** |
| `@tanstack/react-query` | ^4.35 | -> 5. Object syntax only: `useQuery({ queryKey, queryFn })`, `useMutation({ mutationFn })`. `onSuccess` removed from `useQuery` (already avoided). `invalidateQueries({ queryKey })` already used. |
| `react-markdown` | ^8 | -> latest, with `remark-math`, `rehype-katex`, `rehype-raw`. |
| `react-syntax-highlighter` | ^15 | consider `react-shiki`/`shiki` if the Prism/hljs bundle is heavy. |
| `eslint` + react plugins | 8 | -> 9 flat config. |

## 3. Migration touch points already prepared

- React Query invalidation already uses the v5-compatible object form.
- `prop-types` is now declared in `client/package.json`.
- No `onSuccess` on `useQuery` was introduced in new code.

## Verify

```bash
cd server && yarn && yarn lint && yarn db:setup && yarn test
cd client && yarn && yarn lint && yarn build
```

Smoke test: list notes, create/edit/delete a note, render markdown + LaTeX + code, and the
Phase 5 checklist in `PLAN.md`.
