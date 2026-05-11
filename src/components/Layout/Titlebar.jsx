export default function Titlebar() {
  return (
    <div
      className="h-9 bg-panel flex items-center justify-between px-4 shrink-0 drag"
      style={{ borderBottom: '1px solid #2a2a4a' }}
    >
      <div className="flex items-center gap-2 no-drag">
        <span className="text-base">🦊</span>
        <span className="text-cream font-semibold text-sm tracking-wide">Kitsune</span>
      </div>

      <div className="flex no-drag">
        <WinBtn onClick={() => window.electron?.minimize()} label="─" />
        <WinBtn onClick={() => window.electron?.maximize()} label="□" />
        <WinBtn onClick={() => window.electron?.close()}   label="✕" danger />
      </div>
    </div>
  )
}

function WinBtn({ onClick, label, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 text-xs text-muted transition-colors
        ${danger ? 'hover:bg-danger hover:text-white' : 'hover:bg-border hover:text-cream'}`}
    >
      {label}
    </button>
  )
}
