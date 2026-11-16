// Port of Board.java / web/game.js without any DOM access.
import { Square } from './Square.ts'

export const MAX_DIMENSION = 100

export type ClickResult = 'continue' | 'mine' | 'win'

export class Board {
  readonly mineCount: number
  readonly rows: number
  readonly columns: number
  readonly field: Square[][] = []
  // Random square with no adjacent mines, highlighted green as a safe starting point.
  readonly hint: Square | null
  flagCount: number
  safeRemaining: number
  over = false
  private tempMineCount: number
  private squares: number

  constructor(mines: number, rows: number, columns: number) {
    this.mineCount = mines
    this.tempMineCount = mines
    this.flagCount = mines
    this.rows = rows
    this.columns = columns
    this.squares = rows * columns
    this.safeRemaining = rows * columns - mines

    for (let i = 0; i < rows; i++) {
      const row: Square[] = []
      for (let j = 0; j < columns; j++) {
        row.push(new Square(this.random(), i, j))
      }
      this.field.push(row)
    }

    const zeros: Square[] = []
    for (const row of this.field) {
      for (const s of row) {
        if (this.number(s) === 0) zeros.push(s)
      }
    }
    this.hint = zeros.length > 0 ? zeros[Math.floor(Math.random() * zeros.length)] : null
  }

  // Sequential sampling: each cell is a mine with probability remainingMines / remainingCells.
  private random(): boolean {
    const x = Math.floor(Math.random() * this.squares)
    this.squares--
    if (x < this.tempMineCount) {
      this.tempMineCount--
      return true
    }
    return false
  }

  neighbors(square: Square): Square[] {
    const result: Square[] = []
    for (let i = Math.max(0, square.row - 1); i <= Math.min(this.rows - 1, square.row + 1); i++) {
      for (let j = Math.max(0, square.col - 1); j <= Math.min(this.columns - 1, square.col + 1); j++) {
        result.push(this.field[i][j])
      }
    }
    return result
  }

  // Mines in the 3x3 block around (and including) the square, 0–9.
  number(square: Square): number {
    return this.neighbors(square).filter((s) => s.mine).length
  }

  // Square.clicked + Board.reveal, using an explicit stack so large empty regions don't overflow.
  clicked(start: Square): ClickResult {
    const stack = [start]
    while (stack.length > 0) {
      const square = stack.pop()!
      if (square.click) continue
      square.click = true
      if (square.mine) {
        this.over = true
        return 'mine'
      }
      if (square.flag) {
        square.flag = false
        this.flagCount++
      }
      if (this.number(square) === 0) {
        for (const n of this.neighbors(square)) {
          if (n !== square && !n.click) stack.push(n)
        }
      }
      this.safeRemaining--
    }
    if (this.safeRemaining === 0) {
      this.over = true
      return 'win'
    }
    return 'continue'
  }

  leftClick(square: Square): ClickResult {
    if (this.over || square.flag) return 'continue'
    return this.clicked(square)
  }

  rightClick(square: Square): void {
    if (this.over || square.click) return
    square.flag = !square.flag
    this.flagCount += square.flag ? -1 : 1
  }
}
