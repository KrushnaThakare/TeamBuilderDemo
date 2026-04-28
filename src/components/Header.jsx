export function Header({ canDownload, isOnline, loading, onDownload, onReset }) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Live selection room</p>
        <h1>Cricket Team Builder</h1>
        <p className="header-copy">Pick squads, set captains, and sync the match card across every device.</p>
      </div>
      <div className="header-actions">
        <span className={`sync-pill ${isOnline ? 'is-live' : 'is-offline'}`}>
          <span aria-hidden="true" />
          {loading ? 'Syncing...' : isOnline ? 'Live Sync' : 'Setup Needed'}
        </span>
        <button className="primary-button" type="button" onClick={onDownload} disabled={!canDownload}>
          Download Teams
        </button>
        <button className="danger-button" type="button" onClick={onReset}>
          Reset Match
        </button>
      </div>
    </header>
  );
}
