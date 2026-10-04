# Quick notes

CRUD notes for studying. Supports code syntax highlighting, LaTeX and Markdown.
Notes are organized in categories arranged as trees (backed by an ArangoDB graph).

![Quick Notes interface](/screenshot.png?raw=true "Quick Notes interface")

- Usage

  - [Code](#code)
  - [LaTeX](#latex)
  - [Markdown](#markdown)
  - [Managing categories and notes](#managing-categories-and-notes)

- Run
  - [Dev](#dev)
  - [Autostart at system boot with PM2](#autostart-at-system-boot-with-pm2)

- Project docs
  - [`docs/quality-report.md`](docs/quality-report.md) — code quality audit
  - [`docs/tech-stack-upgrade.md`](docs/tech-stack-upgrade.md) — dependency upgrade runbook
  - [`docs/tree-decision.md`](docs/tree-decision.md) — tree component evaluation
  - [`docs/decisions.md`](docs/decisions.md) — decisions log

## Code

Add code as in markdown, with three backticks (\`\`\`) or three tildes (\~\~\~) on the lines before and after the code block, referencing the programming language:

```
~~~javascript
function square(number) {
  return number * number;
}
~~~
```

## LaTeX

Add LaTeX inline expressions between "$" and "$":

```
$x = 0$
```

Add LaTeX blocks:

````
```math
L = \frac{1}{2} \rho v^2 S C_L
```
````

## Markdown

Just enter regular markdown.

## Managing categories and notes

- **Add a category**: the "add category" button above the tree (creates a root), or right-click a
  category → *Add subcategory*.
- **Rename / move / delete a category**: right-click the category. Delete is allowed only when the
  category has no notes and no subcategories (the app explains why if blocked).
- **Move a note**: the move icon on a note card → pick a target category.
- **Move all notes / delete all notes** from a category: right-click the category; both ask for
  confirmation.

See [`docs/decisions.md`](docs/decisions.md) for the exact rules.

## Environment variables

`server/.env` (see `server/.env.example`):

| Var | Purpose |
|---|---|
| `ALLOWED_ORIGINS` | comma-separated hostnames allowed by CORS (required) |
| `CLIENT_PORT` | client port used to build CORS origins (required) |
| `API_PORT` | port the API listens on (required) |
| `DB_HOST` / `DB_NAME` / `DB_USER` / `DB_PASS` | ArangoDB connection |

`client/.env` (see `client/.env.example`):

| Var | Purpose |
|---|---|
| `VITE_API_HOST` | API host, e.g. `http://localhost` |
| `VITE_API_PORT` | API port |

The server validates the required variables at startup and fails fast with a clear message if any
are missing.

## Dev

Prerequisites:

- ArangoDB
- Node.js 14 or greater
- yarn

1. Write your own `.env` files for both server and client based on the examples given
   [here][1] and [here][2].
2. From `server/`, run `yarn && yarn db:setup`. This idempotently creates the `categories` and
   `notes` collections, the `hasSubcategory` edge collection, the `categoriesGraph` graph, and the
   index on `notes.categoryKey`.

### Start the server:

```
$ cd server
$ yarn
$ yarn dev
```

### Start the client:

```
$ cd client
$ yarn
$ yarn dev
```

The app is now available at http://localhost:5173/.

## Autostart at system boot with PM2

Install PM2:

```
$ yarn global add pm2
```

Generate a startup script for PM2:

First enter the following command (without sudo):

```
$ pm2 startup
```

It'll output a custom command. Copy and enter the given custom command.

If you want to remove the startup script later, run:

```
$ pm2 unstartup systemd
```

Now we're gonna launch the processes and then freeze the processes list.

### Server

```
$ cd server
$ pm2 start yarn --name server -- start
```

### Client

Adapt the port in `.env` (let's say, to 3000), build the client and then serve the dist directory:

```
$ cd client
$ yarn build
$ pm2 serve dist 3000 --name client
```

Freeze the processes so PM2 launch them at system boot:

```
$ pm2 save
```

The app is now available at http://localhost:3000/ at every system boot.

[1]: https://github.com/renankrz/quick-notes/blob/main/client/.env.example
[2]: https://github.com/renankrz/quick-notes/blob/main/server/.env.example
