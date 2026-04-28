import { useEffect, useMemo, useState } from 'react';
import { isFirebaseConfigured } from '../firebase';
import { uploadPlayerPhoto } from '../utils/uploadPlayerPhoto';

export function PlayerSearch({ players, onAddPlayer, onSelect }) {
  const [query, setQuery] = useState('');
  const [draftTeam, setDraftTeam] = useState('teamA');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
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

  const resetPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setPhotoError('');
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    setPhotoError('');

    if (!file) {
      resetPhoto();
      return;
    }

    if (!file.type.startsWith('image/')) {
      resetPhoto();
      setPhotoError('Please choose an image file.');
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleAddPlayer = async (event) => {
    event.preventDefault();
    if (!newPlayerName.trim() || isUploading) {
      return;
    }

    setPhotoError('');
    setIsUploading(true);

    try {
      const photoUrl = photoFile && isFirebaseConfigured ? await uploadPlayerPhoto(photoFile) : '';

      await onAddPlayer({
        name: newPlayerName,
        photo: photoUrl,
        photoUrl,
      });
      setNewPlayerName('');
      resetPhoto();
      event.currentTarget.reset();
    } catch (error) {
      setPhotoError(error.message || 'Photo upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

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
              <img src={player.photoUrl || player.photo} alt="" />
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
          value={newPlayerName}
          onChange={(event) => setNewPlayerName(event.target.value)}
          placeholder="New player name"
          required
        />
        <div className="photo-upload-field">
          <label htmlFor="new-player-photo">
            Photo upload <span>(optional)</span>
          </label>
          <input id="new-player-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoPreview && <img className="photo-preview" src={photoPreview} alt="Selected player preview" />}
          {photoError && <small className="form-error">{photoError}</small>}
          {!isFirebaseConfigured && (
            <small className="form-hint">Configure Firebase to upload images; local preview uses default avatars.</small>
          )}
        </div>
        <button className="primary-button" type="submit" disabled={!newPlayerName.trim() || isUploading}>
          {isUploading ? 'Uploading...' : 'Add Player'}
        </button>
      </form>
    </section>
  );
}
