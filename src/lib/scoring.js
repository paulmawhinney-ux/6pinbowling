// 6-Pin Bowling scoring engine
// Rules: 10 frames, 6 pins per rack, 2 throws/frame (3 in frame 10 if strike/spare earned).
// Strike = 6 on throw 1 (frame ends). Spare = throws 1+2 sum to 6.
// Strike bonus = next 2 throws. Spare bonus = next 1 throw. Max game = 120.

export const MAX_PINS = 6;
export const NUM_FRAMES = 10;

// Create a fresh, empty game state for one player.
// Each frame is { throws: [n, n, n?], isStrike, isSpare }
export function createEmptyFrames() {
  return Array.from({ length: NUM_FRAMES }, () => ({ throws: [] }));
}

// How many pins remain standing in a given frame after some throws.
function pinsRemaining(frame, frameIndex) {
  const isTenth = frameIndex === NUM_FRAMES - 1;
  const t = frame.throws;

  if (!isTenth) {
    if (t.length === 0) return MAX_PINS;
    if (t.length === 1) return MAX_PINS - t[0];
    return 0; // frame complete
  }

  // 10th frame special case
  if (t.length === 0) return MAX_PINS;
  if (t.length === 1) {
    if (t[0] === MAX_PINS) return MAX_PINS; // strike: throw 2 is a fresh rack
    return MAX_PINS - t[0];
  }
  if (t.length === 2) {
    const firstWasStrike = t[0] === MAX_PINS;
    if (firstWasStrike) {
      // throw 2 was a fresh rack after the strike. If it was ALSO a strike,
      // throw 3 gets yet another fresh rack. Otherwise throw 3 must clear what's left.
      if (t[1] === MAX_PINS) return MAX_PINS;
      return MAX_PINS - t[1];
    }
    const isSpare = t[0] + t[1] === MAX_PINS;
    if (isSpare) return MAX_PINS; // bonus throw, fresh rack
    return 0; // open frame, no 3rd throw
  }
  return 0; // 3 throws already, done
}

// Max pins allowed for the NEXT throw in this frame.
export function maxForNextThrow(frame, frameIndex) {
  return pinsRemaining(frame, frameIndex);
}

// Is this frame finished (no more throws allowed)?
export function isFrameComplete(frame, frameIndex) {
  const isTenth = frameIndex === NUM_FRAMES - 1;
  const t = frame.throws;

  if (!isTenth) {
    if (t.length === 0) return false;
    if (t.length === 1) return t[0] === MAX_PINS; // strike ends frame early
    return true; // 2 throws always ends a non-strike frame
  }

  // 10th frame
  if (t.length < 2) return false;
  if (t.length === 2) {
    const firstWasStrike = t[0] === MAX_PINS;
    const isSpare = !firstWasStrike && t[0] + t[1] === MAX_PINS;
    return !firstWasStrike && !isSpare; // open frame -> done after 2
  }
  return t.length === 3;
}

// Add a throw of `pins` to the given frame. Returns a NEW frames array.
export function addThrow(frames, frameIndex, pins) {
  const frame = frames[frameIndex];
  const max = maxForNextThrow(frame, frameIndex);
  if (pins < 0 || pins > max) {
    throw new Error(`Invalid throw: ${pins} pins (max ${max})`);
  }
  const newFrames = frames.map((f, i) =>
    i === frameIndex ? { throws: [...f.throws, pins] } : f
  );
  return newFrames;
}

// Remove the last throw recorded anywhere (for "undo"). Returns new frames.
export function removeLastThrow(frames) {
  for (let i = NUM_FRAMES - 1; i >= 0; i--) {
    if (frames[i].throws.length > 0) {
      const newFrames = frames.map((f, idx) =>
        idx === i ? { throws: f.throws.slice(0, -1) } : f
      );
      return newFrames;
    }
  }
  return frames;
}

// Edit a specific throw (by frame + throw index) to a new pin value.
// If the edit makes later throws in THIS frame invalid (e.g. changing throw 1
// to a strike when a throw 2 already existed, or exceeding remaining pins),
// those later throws in the same frame are dropped since they no longer make sense.
// Returns a NEW frames array, or throws an Error if the new value itself is invalid
// (negative, or more pins than physically exist for that throw in isolation).
export function editThrow(frames, frameIndex, throwIndex, newPins) {
  if (newPins < 0 || newPins > MAX_PINS) {
    throw new Error(`Invalid pin value: ${newPins}`);
  }

  const frame = frames[frameIndex];
  if (throwIndex >= frame.throws.length) {
    throw new Error('Cannot edit a throw that has not been recorded yet');
  }

  // Build a hypothetical throws array: keep everything before throwIndex,
  // replace throwIndex's value, then re-validate/truncate everything after
  // within this same frame by replaying them through addThrow's rules.
  const before = frame.throws.slice(0, throwIndex);
  let rebuiltFrame = { throws: before };

  // Validate & apply the edited throw itself against pins remaining at that point.
  const maxAtEdit = maxForNextThrow(rebuiltFrame, frameIndex);
  if (newPins > maxAtEdit) {
    throw new Error(
      `Invalid edit: ${newPins} pins exceeds ${maxAtEdit} remaining at that point`
    );
  }
  rebuiltFrame = { throws: [...before, newPins] };

  // Try to replay any throws that came after the edited one, within this frame.
  // If a later throw is no longer valid (frame already complete, or exceeds
  // pins remaining), drop it and everything after it in this frame.
  const after = frame.throws.slice(throwIndex + 1);
  for (const pins of after) {
    if (isFrameComplete(rebuiltFrame, frameIndex)) break;
    const max = maxForNextThrow(rebuiltFrame, frameIndex);
    if (pins > max) break; // no longer valid, drop this and stop
    rebuiltFrame = { throws: [...rebuiltFrame.throws, pins] };
  }

  const newFrames = frames.map((f, i) => (i === frameIndex ? rebuiltFrame : f));
  return newFrames;
}

// Find the current active frame index (first incomplete frame), or -1 if game over.
export function currentFrameIndex(frames) {
  for (let i = 0; i < NUM_FRAMES; i++) {
    if (!isFrameComplete(frames[i], i)) return i;
  }
  return -1;
}

export function isGameComplete(frames) {
  return currentFrameIndex(frames) === -1;
}

// Flatten all throws across all frames into one array, tagging each with its frame index.
function flattenThrows(frames) {
  const flat = [];
  frames.forEach((frame, fi) => {
    frame.throws.forEach((pins) => flat.push({ pins, frameIndex: fi }));
  });
  return flat;
}

// Compute running/final score per frame. Returns array of { score, cumulative } or null
// for frames that can't be scored yet (waiting on bonus throws).
export function computeScores(frames) {
  const flat = flattenThrows(frames);
  const results = Array(NUM_FRAMES).fill(null);
  let cumulative = 0;

  for (let i = 0; i < NUM_FRAMES; i++) {
    const frame = frames[i];
    const isTenth = i === NUM_FRAMES - 1;

    if (!isTenth) {
      if (frame.throws.length === 0) break;

      const isStrike = frame.throws[0] === MAX_PINS;
      const isSpare =
        !isStrike &&
        frame.throws.length === 2 &&
        frame.throws[0] + frame.throws[1] === MAX_PINS;

      if (isStrike) {
        // need next 2 throws (could be in next frame(s), including 10th frame throws)
        const myFlatIdx = flat.findIndex(
          (t) => t.frameIndex === i
        );
        const bonus1 = flat[myFlatIdx + 1];
        const bonus2 = flat[myFlatIdx + 2];
        if (!bonus1 || !bonus2) break; // not enough data yet
        const frameScore = MAX_PINS + bonus1.pins + bonus2.pins;
        cumulative += frameScore;
        results[i] = { score: frameScore, cumulative };
      } else if (isSpare) {
        const myFlatIdx = flat.findIndex((t) => t.frameIndex === i);
        const lastThrowFlatIdx = myFlatIdx + 1; // second throw of this frame
        const bonus = flat[lastThrowFlatIdx + 1];
        if (!bonus) break;
        const frameScore = MAX_PINS + bonus.pins;
        cumulative += frameScore;
        results[i] = { score: frameScore, cumulative };
      } else if (frame.throws.length === 2) {
        const frameScore = frame.throws[0] + frame.throws[1];
        cumulative += frameScore;
        results[i] = { score: frameScore, cumulative };
      } else {
        break; // only 1 throw so far, not a strike, frame incomplete
      }
    } else {
      // 10th frame: score is just sum of its own throws (no further bonus needed)
      if (!isFrameComplete(frame, i)) break;
      const frameScore = frame.throws.reduce((a, b) => a + b, 0);
      cumulative += frameScore;
      results[i] = { score: frameScore, cumulative };
    }
  }

  return results;
}

export function finalScore(frames) {
  const scores = computeScores(frames);
  const last = scores.filter(Boolean).pop();
  return last ? last.cumulative : 0;
}

// Label for a single throw display (e.g. "X" for strike, "/" for spare second throw)
export function throwLabel(frame, throwIdx, frameIndex) {
  const pins = frame.throws[throwIdx];
  if (pins === undefined) return '';
  const isTenth = frameIndex === NUM_FRAMES - 1;

  if (pins === MAX_PINS) {
    // Strike, UNLESS this is throw 2/3 of 10th frame following a prior strike-reset
    if (!isTenth) return 'X';
    if (throwIdx === 0) return 'X';
    // in 10th frame, a fresh-rack 6 on throw 2 or 3 is still a strike mark
    return 'X';
  }
  if (throwIdx === 0) return String(pins);

  // throw 2 or 3: check for spare against the immediately preceding throw on a fresh rack
  const prev = frame.throws[throwIdx - 1];
  if (!isTenth) {
    if (prev !== MAX_PINS && prev + pins === MAX_PINS) return '/';
    return String(pins);
  }
  // 10th frame logic
  if (throwIdx === 1) {
    if (prev !== MAX_PINS && prev + pins === MAX_PINS) return '/';
    return String(pins);
  }
  // throwIdx === 2
  const prevPrev = frame.throws[0];
  if (prevPrev === MAX_PINS) {
    // throw1 was strike, so throw2 was fresh rack; check throw2+throw3 for spare
    if (prev !== MAX_PINS && prev + pins === MAX_PINS) return '/';
    return String(pins);
  }
  // throw1+2 was a spare, throw3 is a fresh bonus rack on its own
  return String(pins);
}
