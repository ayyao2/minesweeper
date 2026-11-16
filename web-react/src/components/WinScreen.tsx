interface Props {
  onPlayAgain: () => void
}

export function WinScreen({ onPlayAgain }: Props) {
  return (
    <section id="win-screen" className="screen card">
      <h1>You Win!</h1>
      <button id="play-again-button" type="button" className="primary" onClick={onPlayAgain}>
        Play Again
      </button>
    </section>
  )
}
