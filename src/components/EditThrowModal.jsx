import { MAX_PINS, maxForNextThrow } from '../lib/scoring';

// Computes the max valid pins for editing a throw at `throwIndex`, given the
// OTHER throws in the frame before it stay as-is (this mirrors what editThrow
// will validate against, so we never offer an option editThrow would reject).
function maxForEdit(frames, frameIndex, throwIndex) {
  const frame = frames[frameIndex];
  const before = { throws: frame.throws.slice(0, throwIndex) };
  return maxForNextThrow(before, frameIndex);
}

export default function EditThrowModal({
  frames,
  frameIndex,
  throwIndex,
  currentValue,
  onSave,
  onCancel,
}) {
  const max = maxForEdit(frames, frameIndex, throwIndex);
  const options = Array.from({ length: max + 1 }, (_, i) => i);
  const isTenth = frameIndex === 9;

  return (
    <div className="edit-modal-overlay" onClick={onCancel}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-title">
          Edit Frame {frameIndex + 1}{isTenth ? ` · Throw ${throwIndex + 1}` : ''}
        </div>
        <div className="edit-modal-current">
          Current value: <strong>{currentValue}</strong>
        </div>
        <div className="edit-modal-grid">
          {options.map((n) => (
            <button
              type="button"
              key={n}
              className={`pin-btn ${n === MAX_PINS ? 'pin-btn--strike' : ''} ${
                n === currentValue ? 'pin-btn--current' : ''
              }`}
              onClick={() => onSave(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="edit-modal-note">
          Changing this may clear later throws in this frame if they&apos;re no longer valid.
        </div>
        <button type="button" className="edit-modal-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
