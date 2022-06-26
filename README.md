# Quick notes

CRUD notes for studying. Supports basic Markdown and basic LaTeX.

- Run
  - [Run once](#run-once)
  - [Autostart at system boot with PM2](#autostart-at-system-boot-with-pm2)
- Usage
  - [Markdown](#markdown)
  - [LaTeX](#latex)

## Run once

Start the server:

```shell
$ cd server
$ npm install
$ npm start
```

Start the client:

```shell
$ cd client
$ npm install
$ npm start
```

The app is now available in http://localhost:3000/.

## Autostart at system boot with PM2

Build the client:

```shell
$ cd client
$ npm run build
```

Install PM2:

```shell
$ sudo npm install pm2@latest -g
```

Generate a startup script for PM2:

First enter the following command (without sudo):

```shell
$ pm2 startup
```

Then enter the given custom command.

If you want to remove the startup script, run:

```shell
$ pm2 unstartup systemd
```

Now we're gonna launch the processes and then freeze the list.

Start the server:

```shell
$ cd server
$ pm2 start npm --name server -- start
```

Start the client:

```shell
$ cd client
$ pm2 serve dist 3000 --name client
```

Freeze the processes so PM2 launch them at system boot:

```shel
$ pm2 save
```

The app is now available in http://localhost:3000/ at every system boot.

## Markdown

Just type regular markdown.

## LaTeX

Add LaTeX code between "$" and "$", as in

```
$
L = \frac{1}{2} \rho v^2 S C_L
$
```
