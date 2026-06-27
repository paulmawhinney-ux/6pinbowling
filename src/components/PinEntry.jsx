import { MAX_PINS } from '../lib/scoring';

export default function PinEntry({ maxPins, onEnter, onUndo, canUndo }) {
  const options = Array.from({ length: maxPins + 1 }, (_, i) => i);

  return (
    <div className="pin-entry">
      <div className="pin-entry-label">
        Pins knocked down <span className="pin-entry-max">(max {maxPins})</span>
      </div>
      <div className="pin-entry-grid">
        {options.map((n) => (
          <button
            type="button"
            key={n}
            className={`pin-btn ${n === MAX_PINS ? 'pin-btn--strike' : ''}`}
            onClick={() => onEnter(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="undo-btn"
        onClick={onUndo}
        disabled={!canUndo}
      >
        ↩ Undo last throw
      </button>
    </div>
  );
}
