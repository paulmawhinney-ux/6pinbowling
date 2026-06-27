import { useState } from 'react';
import ScoreSheet from './ScoreSheet';
import { computeScores } from '../lib/scoring';
import { computeAverages } from '../lib/storage';

export default function History({ history, onBack }) {
  const [expandedGameId, setExpandedGameId] = useState(null);
  const averages = computeAverages(history);

  if (history.length === 0) {
    return (
      <div className="history-screen">
        <div className="history-header">
          <h1 className="history-title">GAME HISTORY</h1>
          <button type="button" className="back-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
        <div className="empty-history">
          <p>No games saved yet.</p>
          <p className="empty-history-sub">Finish a game to see it show up here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-screen">
      <div className="history-header">
        <h1 className="history-title">GAME HISTORY</h1>
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      <section className="averages-section">
        <h2 className="section-label">Average (last {history.length} game{history.length > 1 ? 's' : ''})</h2>
        <div className="averages-list">
          {averages
            .sort((a, b) => b.average - a.average)
            .map((a) => (
              <div className="average-row" key={a.name}>
                <span className="average-name">{a.name}</span>
                <span className="average-value">{a.average}</span>
                <span className="average-games">{a.gamesPlayed}g</span>
              </div>
            ))}
        </div>
      </section>

      <section className="games-section">
        <h2 className="section-label">Recent games</h2>
        {history.map((game) => {
          const expanded = expandedGameId === game.id;
          const dateLabel = new Date(game.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
          return (
            <div className="history-game-card" key={game.id}>
              <button
                type="button"
                className="history-game-summary"
                onClick={() => setExpandedGameId(expanded ? null : game.id)}
              >
                <span className="history-game-date">{dateLabel}</span>
                <span className="history-game-scores">
                  {game.players
                    .map((p) => `${p.name} ${p.finalScore}`)
                    .join(' · ')}
                </span>
                <span className="history-game-chevron">{expanded ? '▾' : '▸'}</span>
              </button>
              {expanded && (
                <div className="history-game-detail">
                  {game.players.map((p, idx) => (
                    <ScoreSheet
                      key={p.name + idx}
                      playerName={p.name}
                      frames={p.frames}
                      scores={computeScores(p.frames)}
                      activeFrameIndex={-1}
                      isActivePlayer={false}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
