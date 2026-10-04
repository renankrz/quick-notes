# Baseline

Recorded at the start of the `modernization` branch.

## Environment (this machine)

- Node **v14.21.3** — too old for the Vite 5+/React 19 toolchain. Upgrading Node is a
  prerequisite for Phase 2 (tech stack upgrade) and for building the client.
- yarn **1.22.22**.
- ArangoDB: **not reachable** from this environment. Server/db tests and manual API
  verification require a running ArangoDB and a seeded database.

## Consequence for execution

Because of the two constraints above, the following parts of `PLAN.md` are delivered as
**code + documentation** but could **not be executed/verified** here:

- Phase 2 (dependency upgrades) — would require Node LTS; done as a documented runbook in
  `docs/tech-stack-upgrade.md`.
- Phase 4 physical library swap + live prototype — documented as a decision in
  `docs/tree-decision.md`; the current `@mui/x-tree-view` is kept and extended.
- Any `yarn install` / `yarn build` / live-DB test runs.

## What was executed

- Phase 1: quality report (`docs/quality-report.md`) + clear bug fixes in the server.
- Phase 3: new backend feature endpoints (categories add/remove/move/rename; notes
  move/move-all/delete-all/count) with transactions and cycle protection.
- Phase 5 (partial): client API functions + category/note management UI on the existing
  tree component.

## Commands to run once Node LTS + ArangoDB are available

```bash
cd server && yarn && yarn lint && yarn test
cd client && yarn && yarn lint && yarn build
```
