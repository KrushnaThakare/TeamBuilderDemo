import { useMemo, useState } from 'react';
import { PlayerCard } from './PlayerCard';

export function TeamSection({
  accent,
  availablePlayers,
  captainId,
  onCaptainChange,
  onDropPlayer,
  onSelectPlayer,
  onRemove,
  onSwap,
  players,
  teamKey,
  title,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const otherTeam = teamKey === 'teamA' ? 'teamB' : 'teamA';
  const teamColor = accent === 'gold' ? '#ffd166' : '#9df95a';
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return availablePlayers
      .filter((player) => player.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [availablePlayers, normalizedQuery]);

  const handleDrop = (event) => {
    event.preventDefault();
    const playerId = event.dataTransfer.getData('text/plain');

    if (playerId) {
      onDropPlayer(teamKey, playerId);
    }
  };

  const handleSelect = (playerId) => {
    onSelectPlayer(teamKey, playerId);
    setSearchQuery('');
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

      <div className="team-player-search">
        <label className="field-label" htmlFor={`${teamKey}-player-search`}>
          Add player to {title}
        </label>
        <input
          className="input"
          id={`${teamKey}-player-search`}
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={`Search pool for ${title}...`}
          autoComplete="off"
        />
        {normalizedQuery && (
          <div className="team-suggestions" role="listbox" aria-label={`${title} player suggestions`}>
            {suggestions.length > 0 ? (
              suggestions.map((player) => (
                <button key={player.id} type="button" onClick={() => handleSelect(player.id)}>
                  <img src={player.photoUrl || player.photo} alt="" />
                  <span>{player.name}</span>
                </button>
              ))
            ) : (
              <p>No matching available players.</p>
            )}
          </div>
        )}
      </div>

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
