const getCaptainName = (captain) => captain?.name || 'Not selected';

const playerRows = (players, captainId) =>
  players
    .map(
      (player, index) => `
        <li>
          <span class="number">${index + 1}</span>
          <span>${player.name}</span>
          ${player.id === captainId ? '<strong>Captain</strong>' : ''}
        </li>
      `,
    )
    .join('');

const teamCard = (title, players, captain, accent) => `
  <section class="team-card" style="--accent: ${accent}">
    <div class="team-head">
      <div>
        <p>Squad</p>
        <h2>${title}</h2>
      </div>
      <span>${players.length} Players</span>
    </div>
    <div class="captain">Captain: <strong>${getCaptainName(captain)}</strong></div>
    <ol>
      ${
        players.length
          ? playerRows(players, captain?.id)
          : '<li class="empty">No players selected</li>'
      }
    </ol>
  </section>
`;

const buildTeamsHtml = ({ teamA, teamB }) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cricket Team Builder - Teams</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-width: 320px;
        color: #f7fff7;
        background: linear-gradient(135deg, #071b12, #102a1f 55%, #14213d);
        font-family: Inter, Arial, sans-serif;
      }
      .sheet {
        width: min(920px, 100%);
        margin: 0 auto;
        padding: 20px;
      }
      header {
        padding: 22px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.14);
      }
      .eyebrow,
      .team-head p {
        margin: 0 0 6px;
        color: #9df95a;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.13em;
        text-transform: uppercase;
      }
      h1,
      h2 {
        margin: 0;
      }
      h1 {
        font-size: clamp(30px, 9vw, 56px);
        line-height: 0.95;
      }
      .teams {
        display: grid;
        gap: 16px;
        margin-top: 16px;
      }
      .team-card {
        padding: 18px;
        border-top: 6px solid var(--accent);
        border-radius: 26px;
        background: rgba(7, 30, 20, 0.86);
        border-right: 1px solid rgba(255, 255, 255, 0.12);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        border-left: 1px solid rgba(255, 255, 255, 0.12);
      }
      .team-head {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 12px;
      }
      .team-head span,
      .captain {
        color: #d9f8e1;
        font-weight: 800;
      }
      .captain {
        margin: 16px 0;
        padding: 12px;
        border-radius: 18px;
        color: #082015;
        background: linear-gradient(135deg, #c6ff4f, #4efc93);
      }
      ol {
        display: grid;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      li {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.08);
        font-weight: 800;
      }
      li.empty {
        display: block;
        color: #bad7c1;
        text-align: center;
      }
      .number {
        display: inline-grid;
        width: 30px;
        height: 30px;
        place-items: center;
        border-radius: 50%;
        color: #082015;
        background: var(--accent);
      }
      li strong {
        color: #ffd166;
        font-size: 12px;
        text-transform: uppercase;
      }
      @media (min-width: 720px) {
        .sheet { padding: 32px; }
        .teams { grid-template-columns: 1fr 1fr; }
      }
      @media print {
        body { background: #071b12; }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <header>
        <p class="eyebrow">Final team sheet</p>
        <h1>Cricket Team Builder</h1>
      </header>
      <div class="teams">
        ${teamCard('Team A', teamA.players, teamA.captain, '#9df95a')}
        ${teamCard('Team B', teamB.players, teamB.captain, '#ffd166')}
      </div>
    </main>
  </body>
</html>
`;

export function downloadTeams(teamData) {
  const html = buildTeamsHtml(teamData);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `cricket-teams-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
