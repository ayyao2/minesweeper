# minesweeper
Minesweeper game created using Processing and Java.

I initially designed the game in Processing in December 2022 (file: minesweeper.pde), and in July 2023 I created a more sophisticated version using Java, which includes three files: Square.java, Board.Java, and GUI.Java.

In the Processing version, the initial square indicates one safe square without mines in its surrounding 8 squares to start off.
Right-click is a flagging mechanism that turns the square red and prevents it from being clicked until it is unflagged with another right click.
The game restarts when a mine is hit. 

The Java version has the same functionalities as the Processing version, but it also includes a starting screen at the beginning to customize the number of mines, rows, and columns on the board and an ending screen when the game has been beaten.

All of the code is original, and no tutorial was followed. Some of my primary goals with this project were to learn Java Swing and further familiarize myself with Object Oriented Programming. 

## Web version

The `web/` directory contains a browser port of the Java version in plain HTML/CSS/JavaScript (no build step). It keeps the same start screen, mine placement, green starting square, flagging, auto-reveal, and win screen. To run it:

```
python3 -m http.server 8000 --directory web
```

Then open http://localhost:8000.

## React + TypeScript version

The `web-react/` directory is a port of the `web/` version to TypeScript + React, built with Vite. The game logic lives in plain TypeScript (`web-react/src/game/Board.ts`, `Square.ts`) with no DOM or React code, and the React components in `web-react/src/components/` render the start, game, and win screens. It is still a fully client-side static app. To run it:

```
cd web-react
npm install
npm run dev
```

`npm test` runs the Vitest unit tests for the game logic, and `npm run test:e2e` runs the Playwright browser tests (run `npx playwright install chromium` once first). Both run in CI on changes to `web-react/`.

`npm run build` writes a static site to `web-react/dist/` that can be served from any static host (e.g. `python3 -m http.server 8000 --directory web-react/dist`).
