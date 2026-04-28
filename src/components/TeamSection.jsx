import { PlayerCard } from './PlayerCard';

export function TeamSection({
  accent,
  captainId,
  onCaptainChange,
  onDropPlayer,
  onRemove,
  onSwap,
  players,
  teamKey,
  title,
}) {
  const otherTeam = teamKey === 'teamA' ? 'teamB' : 'teamA';
  const teamColor = accent === 'gold' ? '#ffd166' : '#9df95a';

  const handleDrop = (event) => {
    event.preventDefault();
    const playerId = event.dataTransfer.getData('text/plain');

    if (playerId) {
      onDropPlayer(teamKey, playerId);
    }
  };

  return (
    <section
      className="card panel team-section"
      style={{ '--team-color': teamColor }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="section-header">
        <div>
          <p className="eyebrow">Squad</p>
          <h2>{title}</h2>
        </div>
        <span className="team-meta">{players.length} selected</span>
      </div>

      <label className="field-label" htmlFor={`${teamKey}-captain`}>
        Captain
      </label>
      <select
        id={`${teamKey}-captain`}
        className="captain-select"
        onChange={(event) => onCaptainChange(teamKey, event.target.value)}
        value={captainId}
      >
        <option value="">Choose captain</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>

      <div className="team-list">
        {players.length === 0 ? (
          <div className="empty-card">No players selected yet.</div>
        ) : (
          players.map((player) => (
            <PlayerCard key={player.id} player={player} selected={captainId === player.id}>
              <button className="swap-button" type="button" onClick={() => onSwap(player.id, otherTeam)}>
                Swap
              </button>
              <button type="button" className="ghost-button" onClick={() => onRemove(teamKey, player.id)}>
                Release
              </button>
            </PlayerCard>
          ))
        )}
      </div>
    </section>
  );
}
