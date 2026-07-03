import { BracketLogo } from './BracketLogo'

export function Header({ onReplay }: { onReplay: () => void }) {
  return (
    <header className="topline">
      <button
        className="topline-logo-btn"
        onClick={onReplay}
        aria-label="Replay intro"
        title="Replay intro"
      >
        <BracketLogo />
      </button>
      <span className="topline-label">01000100 01010000</span>
    </header>
  )
}
