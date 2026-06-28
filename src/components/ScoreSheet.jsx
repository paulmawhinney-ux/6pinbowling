import { NUM_FRAMES, MAX_PINS, throwLabel, isFrameComplete, finalScore } from '../lib/scoring';

// Renders one player's full 10-frame scoresheet row, paper-scoresheet style,
// plus a final total-score box after frame 10.
// onThrowClick(frameIndex, throwIndex) is called when a recorded throw is clicked,
// for the edit-score feature. Pass null/undefined to disable editing (e.g. read-only history view).
export default function ScoreSheet({
  playerName,
  frames,
  scores,
  activeFrameIndex,
  isActivePlayer,
  onThrowClick,
}) {
  const total = finalScore(frames);
  const hasAnyThrow = frames.some((f) => f.throws.length > 0);

  return (
    <div className={`scoresheet ${isActivePlayer ? 'scoresheet--active' : ''}`}>
      <div className="scoresheet-name">{playerName}</div>
      <div className="scoresheet-grid">
        {frames.map((frame, idx) => {
          const isTenth = idx === NUM_FRAMES - 1;
          const isActive = isActivePlayer && idx === activeFrameIndex;
          const complete = isFrameComplete(frame, idx);
          const scoreEntry = scores[idx];
          const throwIndices = isTenth ? [0, 1, 2] : [0, 1];

          // A non-tenth strike only ever has 1 throw (it ends the frame).
          // Render one centered mark spanning the row instead of two cells
          // with a divider between them.
          const isSingleStrikeFrame =
            !isTenth && frame.throws.length === 1 && frame.throws[0] === MAX_PINS;

          return (
            <div
              key={idx}
              className={`frame-box ${isTenth ? 'frame-box--tenth' : ''} ${
                isActive ? 'frame-box--active' : ''
              } ${complete ? 'frame-box--complete' : ''}`}
            >
              <div className="frame-number">{idx + 1}</div>
              <div className="frame-throws">
                {isSingleStrikeFrame ? (
                  <div
                    className="throw-cell throw-cell--strike-full"
                    onClick={onThrowClick ? () => onThrowClick(idx, 0) : undefined}
                    role={onThrowClick ? 'button' : undefined}
                    tabIndex={onThrowClick ? 0 : undefined}
                  >
                    {throwLabel(frame, 0, idx)}
                  </div>
                ) : (
                  throwIndices.map((throwIdx) => {
                    const hasThrow = frame.throws[throwIdx] !== undefined;
                    return (
                      <div
                        className="throw-cell"
                        key={throwIdx}
                        onClick={
                          onThrowClick && hasThrow ? () => onThrowClick(idx, throwIdx) : undefined
                        }
                        role={onThrowClick && hasThrow ? 'button' : undefined}
                        tabIndex={onThrowClick && hasThrow ? 0 : undefined}
                      >
                        {throwLabel(frame, throwIdx, idx)}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="frame-score">{scoreEntry ? scoreEntry.cumulative : ''}</div>
            </div>
          );
        })}

        <div className="frame-box frame-box--total">
          <div className="frame-number">Total</div>
          <div className="total-score-value">{hasAnyThrow ? total : ''}</div>
        </div>
      </div>
    </div>
  );
}
