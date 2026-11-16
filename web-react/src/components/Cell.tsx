import { memo, type MouseEvent } from 'react'

interface Props {
  row: number
  col: number
  flag: boolean
  click: boolean
  mine: boolean
  hint: boolean
  // Adjacent mine count; only meaningful once revealed.
  n: number
  onReveal: (row: number, col: number) => void
  onFlag: (row: number, col: number) => void
}

export const Cell = memo(function Cell({ row, col, flag, click, mine, hint, n, onReveal, onFlag }: Props) {
  const classes = ['cell']
  if (flag) classes.push('flagged')
  if (click && !mine) classes.push('revealed')
  if (click && mine) classes.push('mine')
  if (hint && !click) classes.push('hint')

  let state = flag ? 'flagged' : 'covered'
  if (click) state = n > 0 ? `${n} adjacent mines` : 'empty'

  const showNumber = click && !mine && n > 0

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    onFlag(row, col)
  }

  return (
    <button
      type="button"
      role="gridcell"
      className={classes.join(' ')}
      data-n={showNumber ? n : undefined}
      aria-label={`Row ${row + 1}, column ${col + 1}, ${state}`}
      onClick={() => onReveal(row, col)}
      onContextMenu={handleContextMenu}
    >
      {showNumber ? n : null}
    </button>
  )
})
