const parseScore = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getWinner = (scores) => {
  const teamA = parseScore(scores.teamA);
  const teamB = parseScore(scores.teamB);

  if (teamA === null || teamB === null) {
    return 'Enter both scores to calculate the winner';
  }

  if (teamA === teamB) {
    return 'Match tied';
  }

  return teamA > teamB ? 'Team A wins' : 'Team B wins';
};

export function ScoreCard({ scores, onScoreChange }) {
  const winner = getWinner(scores);

  return (
    <section className="score-card card">
      <div>
        <p className="eyebrow">Scorecard</p>
        <h2>Match result</h2>
      </div>

      <div className="innings-grid">
        <label>
          <span>1st Innings - Team A Runs</span>
          <input
            min="0"
            type="number"
            value={scores.teamA}
            onChange={(event) => onScoreChange('teamA', event.target.value)}
            placeholder="0"
          />
        </label>
        <label>
          <span>2nd Innings - Team B Runs</span>
          <input
            min="0"
            type="number"
            value={scores.teamB}
            onChange={(event) => onScoreChange('teamB', event.target.value)}
            placeholder="0"
          />
        </label>
      </div>

      <div className="winner-banner">
        <span>Winner</span>
        <strong>{winner}</strong>
      </div>
    </section>
  );
}
