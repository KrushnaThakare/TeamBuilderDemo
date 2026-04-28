export function PlayerCard({
  actionLabel,
  badge,
  children,
  draggable = false,
  onAction,
  onDragStart,
  player,
  selected = false,
}) {
  const photoSource = player.photoUrl || player.photo;

  return (
    <article
      className={`player-card ${selected ? 'player-card--selected' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <img src={photoSource} alt={player.name} className="player-card__avatar" loading="lazy" />
      <div>
        <h3>{player.name}</h3>
        {badge ? <span>{badge}</span> : null}
      </div>
      {onAction ? (
        <button type="button" className="button button--ghost button--small" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
      {children ? <div className="player-card__actions">{children}</div> : null}
    </article>
  );
}
