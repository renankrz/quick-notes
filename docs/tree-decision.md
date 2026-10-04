# Tree Component Decision (Phase 4)

## Requirements

1. Arbitrary depth, hundreds of nodes.
2. Multi-select (notes view aggregates all selected subtrees) + expand/collapse all.
3. Per-node actions: add child, rename, delete, move.
4. Move via drag and drop, **plus** a menu/dialog fallback.
5. Keyboard accessibility; MUI-consistent theming.
6. Optional: search/filter by name (flattened-paths API already exists).

## Options

| Library | License | DnD move | Inline rename | Multi-select | Keyboard a11y | MUI fit | Notes |
|---|---|---|---|---|---|---|---|
| `@mui/x-tree-view` (`RichTreeView`) | MIT (core) | **Pro only** (`itemsReordering`, paid) | custom | yes | yes | native | Reordering/DnD behind the commercial Pro tier. |
| `react-arborist` | MIT | built-in | built-in | yes | yes | needs styling | `onMove/onRename/onCreate/onDelete` map 1:1 to our features; virtualized. |
| `@headless-tree/react` | MIT | yes | via render | yes | yes | full control | Headless: most flexible, most wiring. |
| `react-complex-tree` | MIT | yes | yes | yes | strong | moderate | Mature but less active. |

## Decision

**Current state (this pass):** kept `@mui/x-tree-view` and implemented all features with a
**right-click context menu + dialogs** (add/rename/move/delete category, move/delete all notes),
and a per-note "move to category" action. This delivers every required feature **without** the
paid Pro tier and without a new dependency, and it works with the existing multi-select tree.

**Recommended next step (optional):** if drag-and-drop move is desired, migrate the tree to
**`react-arborist`**. Its `onMove` callback replaces the "Move to…" dialog for the common case
while keeping the dialog as the keyboard/accessible fallback. `onRename`, `onCreate` and
`onDelete` reuse the mutations already wired in `App.jsx`. Rationale: MIT, free DnD, virtualized,
and a callback surface that matches the Phase 3 API exactly.

**Rejected for now:** `RichTreeViewPro` (cost), headless/complex-tree options (more wiring for no
extra benefit over react-arborist for this app).

## If migrating to react-arborist (sketch)

- Replace `CategoriesTree.jsx`/`CustomTreeItem.jsx` with a `<Tree>` fed the same `categories`
  array (`id`=key, `children`).
- `onMove` -> `moveCategory({ key, newParentKey })` (reject drops onto own descendants — the
  server already enforces this and returns a 400 shown in the snackbar).
- `onRename` -> `renameCategory`; node row buttons/menu -> add child, delete, move-all-notes,
  delete-all-notes (dialogs already exist).
- Keep the flattened-paths `CategoryPickerDialog` as the accessible fallback.
