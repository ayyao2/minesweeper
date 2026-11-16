import { useCallback, useState } from 'react'
import { Board } from './game/Board.ts'
import { StartScreen, type BoardSettings } from './components/StartScreen.tsx'
import { GameScreen } from './components/GameScreen.tsx'
import { WinScreen } from './components/WinScreen.tsx'

type Screen = 'start' | 'game' | 'win'

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [startMessage, setStartMessage] = useState('')
  const [settings, setSettings] = useState<BoardSettings>({ mines: '10', rows: '9', cols: '9' })
  const [board, setBoard] = useState<Board | null>(null)

  const backToStart = useCallback((message = '') => {
    setStartMessage(message)
    setBoard(null)
    setScreen('start')
  }, [])

  const handleStart = useCallback((values: BoardSettings, mines: number, rows: number, cols: number) => {
    setSettings(values)
    setStartMessage('')
    setBoard(new Board(mines, rows, cols))
    setScreen('game')
  }, [])

  const handleLose = useCallback(() => backToStart('Boom! You hit a mine.'), [backToStart])
  const handleQuit = useCallback(() => backToStart(), [backToStart])
  const handleWin = useCallback(() => setScreen('win'), [])

  return (
    <main>
      {screen === 'start' && <StartScreen initial={settings} message={startMessage} onStart={handleStart} />}
      {screen === 'game' && board && (
        <GameScreen board={board} onLose={handleLose} onWin={handleWin} onQuit={handleQuit} />
      )}
      {screen === 'win' && <WinScreen onPlayAgain={handleQuit} />}
    </main>
  )
}
