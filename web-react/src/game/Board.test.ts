import { afterEach, describe, expect, it, vi } from 'vitest'
import { Board } from './Board.ts'

afterEach(() => {
  vi.restoreAllMocks()
})

// Board with no random mines, then mines placed at the given cells.
function boardWithMines(rows: number, cols: number, mines: [number, number][]): Board {
  const board = new Board(0, rows, cols)
  for (const [r, c] of mines) board.field[r][c].mine = true
  board.safeRemaining -= mines.length
  board.flagCount = mines.length
  return board
}

const allSquares = (board: Board) => board.field.flat()

describe('mine placement', () => {
  it('always places exactly the requested number of mines', () => {
    for (let i = 0; i < 50; i++) {
      const board = new Board(15, 8, 12)
      expect(allSquares(board).filter((s) => s.mine)).toHaveLength(15)
      expect(board.safeRemaining).toBe(8 * 12 - 15)
      expect(board.flagCount).toBe(15)
    }
  })

  it('uses sequential sampling: random() === 0 fills cells in row-major order', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const board = new Board(10, 9, 9)
    const mines = allSquares(board).map((s) => s.mine)
    expect(mines.slice(0, 10).every(Boolean)).toBe(true)
    expect(mines.slice(10).some(Boolean)).toBe(false)
  })

  it('uses sequential sampling: random() near 1 fills the last cells', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    const board = new Board(3, 4, 4)
    const mines = allSquares(board).map((s) => s.mine)
    expect(mines.slice(-3).every(Boolean)).toBe(true)
    expect(mines.slice(0, -3).some(Boolean)).toBe(false)
  })
})

describe('neighbors and number', () => {
  const board = boardWithMines(3, 3, [[0, 0], [0, 1], [1, 0]])

  it('returns the clipped 3x3 block including the square itself', () => {
    expect(board.neighbors(board.field[0][0])).toHaveLength(4)
    expect(board.neighbors(board.field[0][1])).toHaveLength(6)
    expect(board.neighbors(board.field[1][1])).toHaveLength(9)
    expect(board.neighbors(board.field[1][1])).toContain(board.field[1][1])
  })

  it('counts mines in the block, including the square itself', () => {
    expect(board.number(board.field[0][0])).toBe(3)
    expect(board.number(board.field[1][1])).toBe(3)
    expect(board.number(board.field[2][2])).toBe(0)
  })
})

describe('hint square', () => {
  it('is a cell with zero adjacent mines', () => {
    for (let i = 0; i < 20; i++) {
      const board = new Board(10, 9, 9)
      if (board.hint) expect(board.number(board.hint)).toBe(0)
    }
  })

  it('is null when no cell has zero adjacent mines', () => {
    expect(new Board(8, 3, 3).hint).toBeNull()
  })
})

describe('revealing', () => {
  it('flood-fills empty regions and stops at numbered cells', () => {
    // Row 3 is a wall of mines; clicking the top-left reveals rows 1-2 only.
    const board = boardWithMines(5, 5, [0, 1, 2, 3, 4].map((c) => [2, c] as [number, number]))
    expect(board.leftClick(board.field[0][0])).toBe('continue')
    for (let c = 0; c < 5; c++) {
      expect(board.field[0][c].click).toBe(true)
      expect(board.field[1][c].click).toBe(true)
      expect(board.field[3][c].click).toBe(false)
      expect(board.field[4][c].click).toBe(false)
    }
    expect(board.safeRemaining).toBe(10)
  })

  it('reveals only the clicked cell when it has adjacent mines', () => {
    const board = boardWithMines(3, 3, [[0, 0]])
    expect(board.leftClick(board.field[1][1])).toBe('continue')
    expect(allSquares(board).filter((s) => s.click)).toEqual([board.field[1][1]])
  })

  it('clears a 100x100 empty board without overflowing the stack', () => {
    const board = new Board(0, 100, 100)
    expect(board.leftClick(board.field[50][50])).toBe('win')
    expect(allSquares(board).every((s) => s.click)).toBe(true)
    expect(board.safeRemaining).toBe(0)
  })

  it('ends the game on a mine and ignores further clicks', () => {
    const board = boardWithMines(3, 3, [[0, 0]])
    expect(board.leftClick(board.field[0][0])).toBe('mine')
    expect(board.over).toBe(true)
    expect(board.leftClick(board.field[2][2])).toBe('continue')
    expect(board.field[2][2].click).toBe(false)
  })

  it('reports a win once every safe cell is revealed', () => {
    const board = boardWithMines(1, 3, [[0, 0]])
    expect(board.leftClick(board.field[0][1])).toBe('continue')
    expect(board.leftClick(board.field[0][2])).toBe('win')
    expect(board.over).toBe(true)
  })
})

describe('flagging', () => {
  it('toggles flags and updates flagCount', () => {
    const board = boardWithMines(3, 3, [[0, 0]])
    const square = board.field[2][2]
    board.rightClick(square)
    expect(square.flag).toBe(true)
    expect(board.flagCount).toBe(0)
    board.rightClick(square)
    expect(square.flag).toBe(false)
    expect(board.flagCount).toBe(1)
  })

  it('ignores left-clicks on flagged cells and right-clicks on revealed cells', () => {
    const board = boardWithMines(3, 3, [[0, 0]])
    board.rightClick(board.field[0][0])
    expect(board.leftClick(board.field[0][0])).toBe('continue')
    expect(board.field[0][0].click).toBe(false)

    board.leftClick(board.field[1][1])
    board.rightClick(board.field[1][1])
    expect(board.field[1][1].flag).toBe(false)
    expect(board.flagCount).toBe(0)
  })

  it('removes flags uncovered by flood-fill and restores the count', () => {
    const board = boardWithMines(4, 4, [[0, 0]])
    board.rightClick(board.field[3][3])
    expect(board.flagCount).toBe(0)
    board.leftClick(board.field[3][0])
    expect(board.field[3][3].click).toBe(true)
    expect(board.field[3][3].flag).toBe(false)
    expect(board.flagCount).toBe(1)
  })
})
