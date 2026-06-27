import { useState, useMemo, useCallback } from 'react';
import ScoreSheet from './ScoreSheet';
import PinEntry from './PinEntry';
import {
  createEmptyFrames,
  addThrow,
  removeLastThrow,
  computeScores,
  finalScore,
  currentFrameIndex,
  isGameComplete,
  maxForNextThrow,
} from '../lib/scoring';

export default function Game({ playerNames, onGameComplete, onAbandon }) {
  const [playersState, setPlayersState] = useState(() =>
    playerNames.map((name) => ({ name, frames: createEmptyFrames() }))
  );
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);

  const allScores = useMemo(
    () => playersState.map((p) => computeScores(p.frames)),
    [playersState]
  );

  const playerGameOver = playersState.map((p) => isGameComplete(p.frames));
  const gameOver = playerGameOver.every(Boolean);

  const activePlayer = playersState[activePlayerIdx];
  const activeFrameIdx = activePlayer ? currentFrameIndex(activePlayer.frames) : -1;
  const activeFrame = activeFrameIdx >= 0 ? activePlayer.frames[activeFrameIdx] : null;
  const maxPins = activeFrame ? maxForNextThrow(activeFrame, activeFrameIdx) : 0;

  const canUndoActive = activeFrameIdx >= 0
    ? activePlayer.frames.some((f) => f.throws.length > 0)
    : playersState.some((p) => p.frames.some((f) => f.throws.length > 0));

  // Move to the next player who still has frames left to bowl.
  const advanceTurn = useCallback((fromIdx, players) => {
    const n = players.length;
    for (let step = 1; step <= n; step++) {
      const candidate = (fromIdx + step) % n;
      if (!isGameComplete(players[candidate].frames)) {
        return candidate;
      }
    }
    return fromIdx; // everyone done
  }, []);

  function handlePinEntry(pins) {
    if (activeFrameIdx < 0) return;

    const newFrames = addThrow(activePlayer.frames, activeFrameIdx, pins);
    const newPlayersState = playersState.map((p, i) =>
      i === activePlayerIdx ? { ...p, frames: newFrames } : p
    );
    setPlayersState(newPlayersState);

    const stillGoing = !isGameComplete(newFrames);
    const frameNowComplete = currentFrameIndex(newFrames) !== activeFrameIdx;

    // Advance turn to next player once this player's frame is complete
    // (or their whole game is done), so play rotates frame-by-frame.
    if (frameNowComplete || !stillGoing) {
      const next = advanceTurn(activePlayerIdx, newPlayersState);
      setActivePlayerIdx(next);
    }
  }

  function handleUndo() {
    // Undo the most recent throw for the active player; if they have none,
    // step back to find whoever threw last (simple version: just undo active player's last).
    if (!activePlayer) return;
    const hasThrows = activePlayer.frames.some((f) => f.throws.length > 0);
    if (hasThrows) {
      const newFrames = removeLastThrow(activePlayer.frames);
      setPlayersState((prev) =>
        prev.map((p, i) => (i === activePlayerIdx ? { ...p, frames: newFrames } : p))
      );
    }
  }

  function handleFinishGame() {
    const game = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      players: playersState.map((p) => ({
        name: p.name,
        frames: p.frames,
        finalScore: finalScore(p.frames),
      })),
    };
    onGameComplete(game);
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <h1 className="game-title">SIX PIN</h1>
        <button type="button" className="abandon-btn" onClick={onAbandon}>
          Cancel game
        </button>
      </div>

      <div className="scoresheets-stack">
        {playersState.map((p, idx) => (
          <ScoreSheet
            key={p.name + idx}
            playerName={p.name}
            frames={p.frames}
            scores={allScores[idx]}
            activeFrameIndex={idx === activePlayerIdx ? activeFrameIdx : -1}
            isActivePlayer={idx === activePlayerIdx && !gameOver}
          />
        ))}
      </div>

      {!gameOver && activePlayer && (
        <div className="current-turn-banner">
          <span className="current-turn-name">{activePlayer.name}&apos;s turn</span>
          <span className="current-turn-frame">Frame {activeFrameIdx + 1}</span>
        </div>
      )}

      {!gameOver && activeFrame && (
        <PinEntry
          maxPins={maxPins}
          onEnter={handlePinEntry}
          onUndo={handleUndo}
          canUndo={canUndoActive}
        />
      )}

      {gameOver && (
        <div className="game-complete-panel">
          <div className="game-complete-title">Game complete!</div>
          <div className="final-scores-list">
            {playersState.map((p, idx) => (
              <div className="final-score-row" key={p.name + idx}>
                <span>{p.name}</span>
                <span className="final-score-value">{finalScore(p.frames)}</span>
              </div>
            ))}
          </div>
          <button type="button" className="save-game-btn" onClick={handleFinishGame}>
            Save to history
          </button>
        </div>
      )}
    </div>
  );
}
