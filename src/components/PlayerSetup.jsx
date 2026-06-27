import { useState } from 'react';

export default function PlayerSetup({ onStart, onViewHistory }) {
  const [names, setNames] = useState(['']);

  function updateName(idx, value) {
    setNames((prev) => prev.map((n, i) => (i === idx ? value : n)));
  }

  function addPlayer() {
    if (names.length >= 6) return;
    setNames((prev) => [...prev, '']);
  }

  function removePlayer(idx) {
    setNames((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleStart() {
    const cleaned = names.map((n) => n.trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    onStart(cleaned);
  }

  const canStart = names.some((n) => n.trim().length > 0);

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-pin-row" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <span className="setup-pin" key={i} />
          ))}
        </div>
        <h1 className="setup-title">SIX PIN</h1>
        <p className="setup-subtitle">Rack &apos;em up. Who&apos;s bowling tonight?</p>

        <div className="player-inputs">
          {names.map((name, idx) => (
            <div className="player-input-row" key={idx}>
              <span className="player-input-number">{idx + 1}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(idx, e.target.value)}
                placeholder={`Player ${idx + 1} name`}
                className="player-input"
                maxLength={20}
              />
              {names.length > 1 && (
                <button
                  type="button"
                  className="player-remove-btn"
                  onClick={() => removePlayer(idx)}
                  aria-label={`Remove player ${idx + 1}`}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {names.length < 6 && (
          <button type="button" className="add-player-btn" onClick={addPlayer}>
            + Add another bowler
          </button>
        )}

        <button
          type="button"
          className="start-game-btn"
          onClick={handleStart}
          disabled={!canStart}
        >
          Start Game
        </button>

        <button type="button" className="view-history-link" onClick={onViewHistory}>
          View game history &amp; averages
        </button>
      </div>
    </div>
  );
}
