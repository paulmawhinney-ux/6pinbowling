import { NUM_FRAMES, throwLabel, isFrameComplete } from '../lib/scoring';

// Renders one player's full 10-frame scoresheet row, paper-scoresheet style.
export default function ScoreSheet({ playerName, frames, scores, activeFrameIndex, isActivePlayer }) {
  return (
    <div className={`scoresheet ${isActivePlayer ? 'scoresheet--active' : ''}`}>
      <div className="scoresheet-name">{playerName}</div>
      <div className="scoresheet-grid">
        {frames.map((frame, idx) => {
          const isTenth = idx === NUM_FRAMES - 1;
          const isActive = isActivePlayer && idx === activeFrameIndex;
          const complete = isFrameComplete(frame, idx);
          const scoreEntry = scores[idx];

          return (
            <div
              key={idx}
              className={`frame-box ${isTenth ? 'frame-box--tenth' : ''} ${
                isActive ? 'frame-box--active' : ''
              } ${complete ? 'frame-box--complete' : ''}`}
            >
              <div className="frame-number">{idx + 1}</div>
              <div className="frame-throws">
                {(isTenth ? [0, 1, 2] : [0, 1]).map((throwIdx) => (
                  <div className="throw-cell" key={throwIdx}>
                    {throwLabel(frame, throwIdx, idx)}
                  </div>
                ))}
              </div>
              <div className="frame-score">
                {scoreEntry ? scoreEntry.cumulative : ''}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
