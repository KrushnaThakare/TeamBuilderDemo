import { PlayerCard } from './PlayerCard';

export function PlayerPool({
  onDelete,
  onRestoreDefaults,
  onSelect,
  players,
}) {
  return (
    <section className="panel player-pool">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Available pool</p>
          <h2>Draft players</h2>
        </div>
        <button className="ghost-button" type="button" onClick={onRestoreDefaults}>
          Restore defaults
        </button>
      </div>

      {players.length === 0 ? (
        <div className="empty-state">
          <span>All players are selected.</span>
          <small>Remove or swap players to continue drafting.</small>
        </div>
      ) : (
        <div className="pool-grid">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', player.id);
              }}
            >
              <div className="pool-card-actions">
                <button className="button button--ghost button--small" type="button" onClick={() => onSelect('teamA', player.id)}>
                  Team A
                </button>
                <button className="button button--ghost button--small" type="button" onClick={() => onSelect('teamB', player.id)}>
                  Team B
                </button>
              </div>
              <button
                className="link-button danger"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(player.id);
                }}
              >
                Remove
              </button>
            </PlayerCard>
          ))}
        </div>
      )}
    </section>
  );
}
