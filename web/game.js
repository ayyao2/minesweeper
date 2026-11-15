"use strict";

// Port of Board.java / Square.java / GUI.java to the browser.

const MAX_DIMENSION = 100;

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const winScreen = document.getElementById("win-screen");
const startForm = document.getElementById("start-form");
const minesInput = document.getElementById("mines-input");
const rowsInput = document.getElementById("rows-input");
const colsInput = document.getElementById("cols-input");
const formError = document.getElementById("form-error");
const startMessage = document.getElementById("start-message");
const boardEl = document.getElementById("board");
const flagLabel = document.getElementById("flag-label");

class Square {
  constructor(mine, row, col) {
    this.mine = mine;
    this.flag = false;
    this.click = false;
    this.row = row;
    this.col = col;
    this.el = document.createElement("button");
    this.el.type = "button";
    this.el.className = "cell";
    this.el.setAttribute("role", "gridcell");
    this.updateLabel();
  }

  changeFlag() {
    this.flag = !this.flag;
    this.el.classList.toggle("flagged", this.flag);
    this.updateLabel();
  }

  updateLabel(revealedText) {
    let state = this.flag ? "flagged" : "covered";
    if (this.click) state = revealedText ? `${revealedText} adjacent mines` : "empty";
    this.el.setAttribute("aria-label", `Row ${this.row + 1}, column ${this.col + 1}, ${state}`);
  }
}

class Board {
  constructor(mines, rows, columns) {
    this.mineCount = mines;
    this.tempMineCount = mines;
    this.flagCount = mines;
    this.rows = rows;
    this.columns = columns;
    this.squares = rows * columns;
    this.safeRemaining = rows * columns - mines; // GUI.count
    this.over = false;
    this.field = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        row.push(new Square(this.random(), i, j));
      }
      this.field.push(row);
    }

    // Highlight one square with no adjacent mines in green as a safe starting hint.
    const zeros = [];
    for (const row of this.field) {
      for (const s of row) {
        if (this.number(s) === "") zeros.push(s);
      }
    }
    if (zeros.length > 0) {
      zeros[Math.floor(Math.random() * zeros.length)].el.classList.add("hint");
    }
    document.getElementById("hint-start").hidden = zeros.length === 0;

    this.updateFlagLabel();
  }

  // Sequential sampling: each cell is a mine with probability remainingMines / remainingCells.
  random() {
    const x = Math.floor(Math.random() * this.squares);
    this.squares--;
    if (x < this.tempMineCount) {
      this.tempMineCount--;
      return true;
    }
    return false;
  }

  neighbors(square) {
    const result = [];
    for (let i = Math.max(0, square.row - 1); i <= Math.min(this.rows - 1, square.row + 1); i++) {
      for (let j = Math.max(0, square.col - 1); j <= Math.min(this.columns - 1, square.col + 1); j++) {
        result.push(this.field[i][j]);
      }
    }
    return result;
  }

  // Mines in the 3x3 block around (and including) the square; "" when zero, matching Board.number.
  number(square) {
    const mines = this.neighbors(square).filter((s) => s.mine).length;
    return mines === 0 ? "" : String(mines);
  }

  // Square.clicked + Board.reveal, using an explicit stack so large empty regions don't overflow.
  clicked(start) {
    const stack = [start];
    while (stack.length > 0) {
      const square = stack.pop();
      if (square.click) continue;
      square.click = true;
      if (square.mine) {
        this.over = true;
        square.el.classList.add("mine");
        backToStart("Boom! You hit a mine.");
        return;
      }
      const mines = this.number(square);
      square.el.classList.add("revealed");
      square.el.classList.remove("hint");
      if (square.flag) {
        square.changeFlag();
        this.flagCount++;
      }
      if (mines === "") {
        for (const n of this.neighbors(square)) {
          if (n !== square && !n.click) stack.push(n);
        }
      } else {
        square.el.textContent = mines;
        square.el.dataset.n = mines;
      }
      square.updateLabel(mines);
      this.safeRemaining--;
    }
    this.updateFlagLabel();
    if (this.safeRemaining === 0) {
      this.over = true;
      showWinScreen();
    }
  }

  leftClick(square) {
    if (this.over || square.flag) return;
    this.clicked(square);
  }

  rightClick(square) {
    if (this.over || square.click) return;
    square.changeFlag();
    this.flagCount += square.flag ? -1 : 1;
    this.updateFlagLabel();
  }

  updateFlagLabel() {
    flagLabel.textContent = `Flags: ${this.flagCount}`;
  }

  render(container) {
    container.innerHTML = "";
    container.style.setProperty("--cols", this.columns);
    const lookup = new Map();
    for (const row of this.field) {
      for (const s of row) {
        lookup.set(s.el, s);
        container.appendChild(s.el);
      }
    }
    container.onclick = (e) => {
      const square = lookup.get(e.target.closest(".cell"));
      if (square) this.leftClick(square);
    };
    container.oncontextmenu = (e) => {
      e.preventDefault();
      const square = lookup.get(e.target.closest(".cell"));
      if (square) this.rightClick(square);
    };
  }
}

function showScreen(screen) {
  for (const s of [startScreen, gameScreen, winScreen]) s.hidden = s !== screen;
}

function backToStart(message) {
  startMessage.hidden = !message;
  startMessage.textContent = message || "";
  formError.hidden = true;
  boardEl.innerHTML = "";
  showScreen(startScreen);
}

function showWinScreen() {
  showScreen(winScreen);
}

function parseField(input, name) {
  const value = Number(input.value);
  if (input.value.trim() === "" || !Number.isInteger(value)) {
    throw new Error(`${name} must be a whole number.`);
  }
  return value;
}

startForm.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const mines = parseField(minesInput, "Number of mines");
    const rows = parseField(rowsInput, "Number of rows");
    const cols = parseField(colsInput, "Number of columns");
    if (rows < 1 || cols < 1 || rows > MAX_DIMENSION || cols > MAX_DIMENSION) {
      throw new Error(`Rows and columns must be between 1 and ${MAX_DIMENSION}.`);
    }
    if (mines < 0 || mines >= rows * cols) {
      throw new Error(`Number of mines must be between 0 and ${rows * cols - 1}.`);
    }
    const board = new Board(mines, rows, cols);
    board.render(boardEl);
    startMessage.hidden = true;
    formError.hidden = true;
    showScreen(gameScreen);
  } catch (err) {
    formError.textContent = err.message;
    formError.hidden = false;
  }
});

document.getElementById("quit-button").addEventListener("click", () => backToStart());
document.getElementById("play-again-button").addEventListener("click", () => backToStart());
