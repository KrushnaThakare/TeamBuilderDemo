import { useMemo } from 'react';
import { Header } from './components/Header';
import { PlayerPool } from './components/PlayerPool';
import { PlayerSearch } from './components/PlayerSearch';
import { ScoreCard } from './components/ScoreCard';
import { TeamSection } from './components/TeamSection';
import { useMatchRoom } from './hooks/useMatchRoom';
import './styles.css';

function App() {
  const {
    players,
    match,
    loading,
    error,
    isFirebaseConfigured,
    addPlayer,
    deletePlayer,
    removePlayerFromTeam,
    resetMatch,
    restoreDefaultPlayers,
    selectPlayer,
    swapPlayer,
    updateCaptain,
    updateScore,
  } = useMatchRoom();

  const selectedIds = useMemo(
    () => new Set([...match.teamA, ...match.teamB]),
    [match.teamA, match.teamB],
  );

  const availablePlayers = useMemo(
    () => players.filter((player) => !selectedIds.has(player.id)),
    [players, selectedIds],
  );

  const playerMap = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const teamAPlayers = match.teamA.map((id) => playerMap.get(id)).filter(Boolean);
  const teamBPlayers = match.teamB.map((id) => playerMap.get(id)).filter(Boolean);

  return (
    <div className="app-shell">
      <Header isOnline={isFirebaseConfigured} loading={loading} onReset={resetMatch} />

      {error && <div className="notice notice-error">{error}</div>}
      {!isFirebaseConfigured && (
        <div className="notice">
          Running with sample local data. Add Firebase environment variables for live collaboration.
        </div>
      )}

      <main className="layout">
        <section className="panel hero-panel">
          <div>
            <p className="eyebrow">Live selection room</p>
            <h2>Build two balanced cricket squads in real time.</h2>
            <p>
              Captains can pick from the shared player pool, set leaders, swap players, and keep a
              lightweight scorecard synced across every device.
            </p>
          </div>
          {loading && <span className="sync-pill">Syncing...</span>}
        </section>

        <PlayerSearch players={availablePlayers} onSelect={selectPlayer} onAddPlayer={addPlayer} />

        <div className="teams-grid">
          <TeamSection
            title="Team A"
            teamKey="teamA"
            accent="green"
            players={teamAPlayers}
            captainId={match.captains.teamA}
            onCaptainChange={updateCaptain}
            onDropPlayer={selectPlayer}
            onRemove={removePlayerFromTeam}
            onSwap={swapPlayer}
          />
          <TeamSection
            title="Team B"
            teamKey="teamB"
            accent="gold"
            players={teamBPlayers}
            captainId={match.captains.teamB}
            onCaptainChange={updateCaptain}
            onDropPlayer={selectPlayer}
            onRemove={removePlayerFromTeam}
            onSwap={swapPlayer}
          />
        </div>

        <ScoreCard scores={match.scores} innings={match.innings} onScoreChange={updateScore} />

        <PlayerPool
          players={availablePlayers}
          selectedTeam="teamA"
          onSelect={selectPlayer}
          onDelete={deletePlayer}
          onRestoreDefaults={restoreDefaultPlayers}
        />
      </main>
    </div>
  );
}

export default App;
