import { useMemo, useState } from 'react';

export function PlayerSearch({ players, onAddPlayer, onSelect }) {
  const [query, setQuery] = useState('');
  const [draftTeam, setDraftTeam] = useState('teamA');
  const [newPlayer, setNewPlayer] = useState({ name: '', photoUrl: '' });
  const normalizedQuery = query.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return players
      .filter((player) => player.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [normalizedQuery, players]);

  const handleSelect = (playerId) => {
    onSelect(draftTeam, playerId);
    setQuery('');
  };

  const handleAddPlayer = async (event) => {
    event.preventDefault();
    if (!newPlayer.name.trim()) {
      return;
    }

    await onAddPlayer(newPlayer);
    setNewPlayer({ name: '', photoUrl: '' });
  };

  return (
    <section className="card panel player-search">
      <div className="section-header">
        <div>
          <p className="eyebrow">Player management</p>
          <h2>Find or add players</h2>
          <p>Search the available pool, then draft a player straight into a team.</p>
        </div>
      </div>

      <div className="draft-toggle" aria-label="Draft target team">
        <button
          className={draftTeam === 'teamA' ? 'active' : ''}
          type="button"
          onClick={() => setDraftTeam('teamA')}
        >
          Team A
        </button>
        <button
          className={draftTeam === 'teamB' ? 'active' : ''}
          type="button"
          onClick={() => setDraftTeam('teamB')}
        >
          Team B
        </button>
      </div>

      <div className="search-box">
        <label className="sr-only" htmlFor="player-search">
          Search available players
        </label>
        <input
          className="input"
          id="player-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a player name..."
          autoComplete="off"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions" role="listbox" aria-label="Player suggestions">
          {suggestions.map((player) => (
            <button
              key={player.id}
              className="suggestion"
              type="button"
              onClick={() => handleSelect(player.id)}
            >
              <img src={player.photoUrl} alt="" />
              <span>
                {player.name}
                <small>Add to {draftTeam === 'teamA' ? 'Team A' : 'Team B'}</small>
              </span>
            </button>
          ))}
        </div>
      )}

      <form className="add-player-form" onSubmit={handleAddPlayer}>
        <label className="sr-only" htmlFor="new-player-name">
          New player name
        </label>
        <input
          className="input"
          id="new-player-name"
          type="text"
          value={newPlayer.name}
          onChange={(event) => setNewPlayer((current) => ({ ...current, name: event.target.value }))}
          placeholder="New player name"
        />
        <label className="sr-only" htmlFor="new-player-photo">
          New player photo URL
        </label>
        <input
          className="input"
          id="new-player-photo"
          type="url"
          value={newPlayer.photoUrl}
          onChange={(event) => setNewPlayer((current) => ({ ...current, photoUrl: event.target.value }))}
          placeholder="Photo URL (optional)"
        />
        <button className="primary-button" type="submit">
          Add Player
        </button>
      </form>
    </section>
  );
}
