const SHEET_WIDTH = 1080;
const PADDING = 54;
const CARD_GAP = 28;
const CARD_WIDTH = SHEET_WIDTH - PADDING * 2;
const ROW_HEIGHT = 58;
const FONT_FAMILY = 'Inter, Arial, sans-serif';

const getCaptainName = (captain) => captain?.name || 'Not selected';

const roundRect = (context, x, y, width, height, radius) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
};

const drawText = (context, text, x, y, options = {}) => {
  const {
    color = '#f7fff7',
    font = `700 28px ${FONT_FAMILY}`,
    maxWidth,
    textAlign = 'left',
  } = options;

  context.fillStyle = color;
  context.font = font;
  context.textAlign = textAlign;
  context.textBaseline = 'top';
  context.fillText(text, x, y, maxWidth);
};

const truncateText = (context, text, maxWidth) => {
  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  let truncated = text;
  while (truncated.length > 0 && context.measureText(`${truncated}...`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }

  return `${truncated}...`;
};

const drawPlayerRow = (context, player, index, captainId, x, y, accent) => {
  roundRect(context, x, y, CARD_WIDTH - 36, ROW_HEIGHT, 18);
  context.fillStyle = 'rgba(255, 255, 255, 0.09)';
  context.fill();

  context.beginPath();
  context.arc(x + 31, y + ROW_HEIGHT / 2, 18, 0, Math.PI * 2);
  context.fillStyle = accent;
  context.fill();

  drawText(context, String(index + 1), x + 31, y + 17, {
    color: '#082015',
    font: `800 18px ${FONT_FAMILY}`,
    textAlign: 'center',
  });

  const isCaptain = player.id === captainId;
  const nameMaxWidth = isCaptain ? CARD_WIDTH - 250 : CARD_WIDTH - 140;
  const name = truncateText(context, player.name, nameMaxWidth);

  drawText(context, name, x + 64, y + 16, {
    font: `800 24px ${FONT_FAMILY}`,
    maxWidth: nameMaxWidth,
  });

  if (isCaptain) {
    drawText(context, 'CAPTAIN', x + CARD_WIDTH - 132, y + 19, {
      color: '#ffd166',
      font: `800 16px ${FONT_FAMILY}`,
      textAlign: 'right',
    });
  }
};

const getTeamHeight = (players) => 176 + Math.max(players.length, 1) * (ROW_HEIGHT + 12);

const drawTeamCard = (context, title, team, x, y, accent) => {
  const { captain, players } = team;
  const height = getTeamHeight(players);

  roundRect(context, x, y, CARD_WIDTH, height, 30);
  context.fillStyle = 'rgba(7, 30, 20, 0.9)';
  context.fill();
  context.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  context.lineWidth = 2;
  context.stroke();

  roundRect(context, x, y, CARD_WIDTH, 10, 5);
  context.fillStyle = accent;
  context.fill();

  drawText(context, 'SQUAD', x + 28, y + 28, {
    color: '#9df95a',
    font: `800 16px ${FONT_FAMILY}`,
  });
  drawText(context, title, x + 28, y + 52, {
    font: `800 42px ${FONT_FAMILY}`,
  });
  drawText(context, `${players.length} players`, x + CARD_WIDTH - 28, y + 38, {
    color: '#d9f8e1',
    font: `800 22px ${FONT_FAMILY}`,
    textAlign: 'right',
  });

  const captainGradient = context.createLinearGradient(x + 28, y + 108, x + CARD_WIDTH - 28, y + 108);
  captainGradient.addColorStop(0, '#c6ff4f');
  captainGradient.addColorStop(1, '#4efc93');
  roundRect(context, x + 28, y + 106, CARD_WIDTH - 56, 48, 18);
  context.fillStyle = captainGradient;
  context.fill();
  drawText(context, `Captain: ${getCaptainName(captain)}`, x + 48, y + 119, {
    color: '#082015',
    font: `800 22px ${FONT_FAMILY}`,
    maxWidth: CARD_WIDTH - 96,
  });

  if (players.length === 0) {
    roundRect(context, x + 18, y + 174, CARD_WIDTH - 36, ROW_HEIGHT, 18);
    context.fillStyle = 'rgba(255, 255, 255, 0.08)';
    context.fill();
    drawText(context, 'No players selected', x + CARD_WIDTH / 2, y + 191, {
      color: '#bad7c1',
      font: `800 22px ${FONT_FAMILY}`,
      textAlign: 'center',
    });
    return height;
  }

  players.forEach((player, index) => {
    drawPlayerRow(context, player, index, captain?.id, x + 18, y + 174 + index * (ROW_HEIGHT + 12), accent);
  });

  return height;
};

const buildCanvas = ({ teamA, teamB }) => {
  const teamAHeight = getTeamHeight(teamA.players);
  const teamBHeight = getTeamHeight(teamB.players);
  const canvas = document.createElement('canvas');
  const height = PADDING + 172 + CARD_GAP + teamAHeight + CARD_GAP + teamBHeight + PADDING;

  canvas.width = SHEET_WIDTH;
  canvas.height = height;

  const context = canvas.getContext('2d');
  const background = context.createLinearGradient(0, 0, SHEET_WIDTH, height);
  background.addColorStop(0, '#071b12');
  background.addColorStop(0.58, '#102a1f');
  background.addColorStop(1, '#14213d');
  context.fillStyle = background;
  context.fillRect(0, 0, SHEET_WIDTH, height);

  context.beginPath();
  context.arc(SHEET_WIDTH - 95, 75, 92, 0, Math.PI * 2);
  context.fillStyle = 'rgba(243, 56, 63, 0.28)';
  context.fill();
  context.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(SHEET_WIDTH - 95, 5);
  context.lineTo(SHEET_WIDTH - 95, 145);
  context.stroke();

  roundRect(context, PADDING, PADDING, CARD_WIDTH, 172, 34);
  context.fillStyle = 'rgba(255, 255, 255, 0.09)';
  context.fill();
  context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  context.lineWidth = 2;
  context.stroke();

  drawText(context, 'FINAL TEAM SHEET', PADDING + 28, PADDING + 28, {
    color: '#9df95a',
    font: `800 18px ${FONT_FAMILY}`,
  });
  drawText(context, 'SPCC Teams', PADDING + 28, PADDING + 58, {
    font: `800 58px ${FONT_FAMILY}`,
    maxWidth: CARD_WIDTH - 56,
  });
  drawText(context, new Date().toLocaleDateString(), PADDING + 28, PADDING + 124, {
    color: '#d9f8e1',
    font: `700 22px ${FONT_FAMILY}`,
  });

  const teamAY = PADDING + 172 + CARD_GAP;
  const teamBY = teamAY + teamAHeight + CARD_GAP;
  drawTeamCard(context, 'Team A', teamA, PADDING, teamAY, '#9df95a');
  drawTeamCard(context, 'Team B', teamB, PADDING, teamBY, '#ffd166');

  return canvas;
};

export async function downloadTeams(teamData) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = buildCanvas(teamData);
  const url = canvas.toDataURL('image/jpeg', 0.95);
  const link = document.createElement('a');

  link.href = url;
  link.download = `cricket-teams-${new Date().toISOString().slice(0, 10)}.jpg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
