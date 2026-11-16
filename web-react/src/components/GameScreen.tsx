import { useCallback, useState, type CSSProperties } from 'react'
import type { Board } from '../game/Board.ts'
import { Cell } from './Cell.tsx'

interface Props {
  board: Board
  onLose: () => void
  onWin: () => void
  onQuit: () => void
}

export function GameScreen({ board, onLose, onWin, onQuit }: Props) {
  // Board mutates its squares in place; bump this to re-render after each move.
  const [, setVersion] = useState(0)

  const handleReveal = useCallback(
    (row: number, col: number) => {
      const result = board.leftClick(board.field[row][col])
      setVersion((v) => v + 1)
      if (result === 'mine') onLose()
      else if (result === 'win') onWin()
    },
    [board, onLose, onWin],
  )

  const handleFlag = useCallback(
    (row: number, col: number) => {
      board.rightClick(board.field[row][col])
      setVersion((v) => v + 1)
    },
    [board],
  )

  return (
    <section id="game-screen" className="screen">
      <header className="game-header">
        <div className="flag-label">
          <span className="icon-flag" aria-hidden="true"></span>
          <span id="flag-label">Flags: {board.flagCount}</span>
        </div>
        <button id="quit-button" type="button" className="secondary" onClick={onQuit}>
          New Game
        </button>
      </header>
      <p className="hint">
        Left-click to reveal, right-click to flag.
        {board.hint && (
          <span id="hint-start">
            {' '}Start on the <span className="hint-swatch"></span> green square.
          </span>
        )}
      </p>
      <div className="board-wrapper">
        <div
          id="board"
          className="board"
          role="grid"
          aria-label="Minesweeper board"
          style={{ '--cols': board.columns } as CSSProperties}
        >
          {board.field.flat().map((s) => (
            <Cell
              key={`${s.row}-${s.col}`}
              row={s.row}
              col={s.col}
              flag={s.flag}
              click={s.click}
              mine={s.mine}
              hint={s === board.hint}
              n={s.click ? board.number(s) : 0}
              onReveal={handleReveal}
              onFlag={handleFlag}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
