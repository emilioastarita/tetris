# Typescript Tetris

![Tetris screenshot](./screenshot.jpg?raw=true)

### [Visit the demo](https://tetris.cloudymedia.com/)

## Typescript Tetris

Recently I was trying to migrate some old projects that I had coded for fun
to typescript.

Is always a lot of fun to program a game and tetris is not the exception. 
Additionally, you learn a lot of concepts trying to figure out the mechanics.

This implementation is based in HTML Canvas element, and I've tried to avoid 
the use of any framework because there is already a game loop there doing the work.

For the UI I bind an object to dom elements using some magic methods with ES6 Proxy. 
This is a really naive implementation of dom binding, but it works, and also 
it saves some bytes. If you are interested take a look at `lib/bind.ts`.

The bundle is generated with webpack and because the output is completely static,
I took the opportunity to test [Cloudflare pages](https://pages.cloudflare.com/).

Happy hacking and have a nice day my friend!
