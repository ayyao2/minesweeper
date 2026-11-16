import { useState, type FormEvent } from 'react'
import { MAX_DIMENSION } from '../game/Board.ts'

export interface BoardSettings {
  mines: string
  rows: string
  cols: string
}

interface Props {
  initial: BoardSettings
  message: string
  onStart: (values: BoardSettings, mines: number, rows: number, cols: number) => void
}

function parseField(raw: string, name: string): number {
  const value = Number(raw)
  if (raw.trim() === '' || !Number.isInteger(value)) {
    throw new Error(`${name} must be a whole number.`)
  }
  return value
}

export function StartScreen({ initial, message, onStart }: Props) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState('')

  const update = (key: keyof BoardSettings) => (e: { target: HTMLInputElement }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const mines = parseField(values.mines, 'Number of mines')
      const rows = parseField(values.rows, 'Number of rows')
      const cols = parseField(values.cols, 'Number of columns')
      if (rows < 1 || cols < 1 || rows > MAX_DIMENSION || cols > MAX_DIMENSION) {
        throw new Error(`Rows and columns must be between 1 and ${MAX_DIMENSION}.`)
      }
      if (mines < 0 || mines >= rows * cols) {
        throw new Error(`Number of mines must be between 0 and ${rows * cols - 1}.`)
      }
      setError('')
      onStart(values, mines, rows, cols)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section id="start-screen" className="screen card">
      <h1>Minesweeper</h1>
      <p id="start-message" className="message" hidden={!message}>
        {message}
      </p>
      <form id="start-form" noValidate onSubmit={handleSubmit}>
        <label>
          <span>Number of Mines</span>
          <input id="mines-input" type="number" min="1" step="1" placeholder="Number of Mines" required
            value={values.mines} onChange={update('mines')} />
        </label>
        <label>
          <span>Number of Rows</span>
          <input id="rows-input" type="number" min="1" step="1" placeholder="Number of Rows" required
            value={values.rows} onChange={update('rows')} />
        </label>
        <label>
          <span>Number of Columns</span>
          <input id="cols-input" type="number" min="1" step="1" placeholder="Number of Columns" required
            value={values.cols} onChange={update('cols')} />
        </label>
        <p id="form-error" className="error" hidden={!error}>
          {error}
        </p>
        <button type="submit" className="primary">Click To Start</button>
      </form>
    </section>
  )
}
