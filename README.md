# Quick notes

CRUD notes for studying. Supports code syntax highlighting, LaTeX and Markdown.

![Quick Notes interface](/screenshot.png?raw=true "Quick Notes interface")

- Usage
  - [Code](#code)
  - [LaTeX](#latex)
  - [Markdown](#markdown)

- Run
  - [Dev](#dev)
  - [Autostart at system boot with PM2](#autostart-at-system-boot-with-pm2)



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

Add LaTeX blocks between "$$" and "$$":

```
$$
L = \frac{1}{2} \rho v^2 S C_L
$$
```

## Markdown

Just enter regular markdown.

## Dev

First write your own `.env` file based on the [example][1]. Then start the server:

```
$ cd server
$ yarn
$ yarn dev
```

Start the client:

```
$ cd client
$ yarn
$ yarn dev
```

The app is now available at http://localhost:5173/.

## Autostart at system boot with PM2

Build the client:

```
$ cd client
$ npm run build
```

Install PM2:

```
$ sudo npm install pm2@latest -g
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

[1]: https://github.com/renankrz/quick-notes/blob/main/server/.env.example
