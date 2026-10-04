# Decisions Log

Decisions taken where `PLAN.md` said "decide". Format: decision — rationale.

## Backend

- **Sibling name uniqueness: enforced.** `POST /categories` returns 409 if a sibling under the
  same parent already has the same name. Root-level uniqueness is not enforced (no cheap sibling
  query without a synthetic root); acceptable since roots are few. — predictable paths, avoids
  confusing duplicate breadcrumbs.
- **Category delete rule: reject if it has notes OR subcategories (both 409).** — keeps the rule
  simple and safe; the UI tells the user to move/delete notes and children first.
- **Move a single note: keep its `rank`.** `PATCH /notes/:key/category` only changes
  `categoryKey`. — least surprising; re-ranking is a separate concern.
- **Bulk operations require `confirm: true` in the body.** `POST /notes/move` and
  `DELETE /notes?categoryKey=...`. — a second guard against accidental mass changes; the UI sets
  it explicitly.
- **`includeDescendants` defaults to `false`** for move-all/delete-all/count. — "all notes from a
  category" means that category, not its subtree, matching the TODO wording. Subtree behavior is
  available via the flag.
- **Multi-step writes use ArangoDB stream transactions** (`addCategory`, `deleteCategory`,
  `moveCategory`). — prevents orphan vertices/edges on partial failure.
- **Cycle protection on move** is done in the route (descendant check) before the transaction. —
  clear 400 message; cheap OUTBOUND traversal.

## Frontend

- **Kept `@mui/x-tree-view`; features via context menu + dialogs** rather than drag-and-drop. —
  avoids the paid Pro tier and a new dependency; see `docs/tree-decision.md`. DnD is an optional
  follow-up with `react-arborist`.
- **Category picking uses the flattened-paths Autocomplete** (full breadcrumbs). — reuses an
  existing API and reads well for deep trees; for category moves the node and its descendants are
  excluded to prevent cycles client-side too.
- **Server error messages surfaced in a Snackbar.** API helpers parse the `{ error }` body so 409
  reasons ("has notes" / "has subcategories") reach the user.

## Not done here (documented, deferred)

- **Dependency upgrades (Phase 2):** blocked by Node 14 on this machine — see
  `docs/tech-stack-upgrade.md`.
- **Server tests + CI:** require a live/ephemeral ArangoDB; runbook commands provided in
  `docs/baseline.md` and `docs/tech-stack-upgrade.md`.
- **XSS sanitization (`rehype-sanitize`):** flagged in `docs/quality-report.md`; deferred to keep
  KaTeX/highlighting behavior unchanged under the current single-user assumption.
- **Data-layer simplification** (derive expandable/selectable/paths from one tree query): the four
  queries were left in place to avoid a risky refactor without a runnable build; new code adds no
  further `useRef`/`onSuccess` coupling.
