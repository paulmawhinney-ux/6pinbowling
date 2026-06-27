import { addThrow, createEmptyFrames, computeScores, finalScore, isGameComplete } from '../scoring.js';

function play(throwsList) {
  let frames = createEmptyFrames();
  for (const [frameIdx, pins] of throwsList) {
    frames = addThrow(frames, frameIdx, pins);
  }
  return frames;
}

function assertEqual(actual, expected, label) {
  const pass = actual === expected;
  console.log(`${pass ? 'PASS' : 'FAIL'} - ${label}: expected ${expected}, got ${actual}`);
  if (!pass) process.exitCode = 1;
}

// Test 1: All gutters -> 0
{
  const throwsList = [];
  for (let f = 0; f < 10; f++) { throwsList.push([f, 0]); throwsList.push([f, 0]); }
  const frames = play(throwsList);
  assertEqual(finalScore(frames), 0, 'All gutter balls');
}

// Test 2: Perfect game - all strikes -> 180 (6-pin analog of 10-pin's 300: 10 frames x 18 each,
// where 18 = 6 (strike) + 6 + 6 (next two bonus throws), same compounding logic as 10-pin's 10x30=300)
{
  const throwsList = [];
  for (let f = 0; f < 9; f++) throwsList.push([f, 6]);
  // 10th frame: strike, strike, strike
  throwsList.push([9, 6]); throwsList.push([9, 6]); throwsList.push([9, 6]);
  const frames = play(throwsList);
  assertEqual(finalScore(frames), 180, 'Perfect game (all strikes)');
  assertEqual(isGameComplete(frames), true, 'Perfect game is complete');
}

// Test 3: All spares of 3+3, with final throw of 3 -> each frame = 6 + 3 = 9, except last frame
// Frames 1-9: 3,3 spare, bonus next throw is 3 => 9 each = 81
// Frame 10: 3,3 spare then bonus throw of 3 => 3+3+3 = 9
// Total = 81 + 9 = 90
{
  const throwsList = [];
  for (let f = 0; f < 9; f++) { throwsList.push([f, 3]); throwsList.push([f, 3]); }
  throwsList.push([9, 3]); throwsList.push([9, 3]); throwsList.push([9, 3]);
  const frames = play(throwsList);
  assertEqual(finalScore(frames), 90, 'All spares (3,3) with final bonus 3');
}

// Test 4: Single strike in frame 1, then 3,2 in frame 2, rest gutters
// Frame 1 score = 6 + 3 + 2 = 11 (bonus = next two throws = 3,2)
// Frame 2 score = 3 + 2 = 5
// Total = 16
{
  const throwsList = [[0, 6], [1, 3], [1, 2]];
  for (let f = 2; f < 10; f++) { throwsList.push([f, 0]); throwsList.push([f, 0]); }
  const frames = play(throwsList);
  const scores = computeScores(frames);
  assertEqual(scores[0].score, 11, 'Frame 1 strike bonus score');
  assertEqual(scores[1].score, 5, 'Frame 2 score');
  assertEqual(finalScore(frames), 16, 'Total after single strike + open frame');
}

// Test 5: Spare in frame 1 (4,2), then 5 in frame 2 throw 1
// Frame 1 score = 6 + 5 (bonus = next throw) = 11
{
  const throwsList = [[0, 4], [0, 2], [1, 5]];
  const frames = play(throwsList);
  const scores = computeScores(frames);
  assertEqual(scores[0].score, 11, 'Frame 1 spare bonus score');
}

// Test 6: Strike in frame 9, strike in frame 10 throw 1, then 4,1 in frame 10
// Frame 9 (idx 8) strike bonus = next 2 throws = frame10 throw1(6), throw2(4) => 6+6+4=16
// Frame 10 = 6+4+1 = 11
{
  const throwsList = [];
  for (let f = 0; f < 8; f++) { throwsList.push([f, 0]); throwsList.push([f, 0]); }
  throwsList.push([8, 6]); // strike frame 9
  throwsList.push([9, 6]); throwsList.push([9, 4]); throwsList.push([9, 1]);
  const frames = play(throwsList);
  const scores = computeScores(frames);
  assertEqual(scores[8].score, 16, 'Frame 9 strike bonus pulls from frame 10');
  assertEqual(scores[9].score, 11, 'Frame 10 score (strike + 4 + 1)');
  assertEqual(finalScore(frames), 27, 'Total score frame9 strike into frame10');
}

// Test 7: Open frame in 10th (no strike/spare) -> only 2 throws allowed
{
  const throwsList = [];
  for (let f = 0; f < 9; f++) { throwsList.push([f, 0]); throwsList.push([f, 0]); }
  throwsList.push([9, 2]); throwsList.push([9, 1]);
  const frames = play(throwsList);
  assertEqual(isGameComplete(frames), true, '10th frame open completes after 2 throws');
  assertEqual(finalScore(frames), 3, '10th frame open frame score');
  // Try adding a 3rd throw - should throw an error
  try {
    addThrow(frames, 9, 3);
    console.log('FAIL - 10th frame open should not allow 3rd throw');
    process.exitCode = 1;
  } catch (e) {
    console.log('PASS - 10th frame open frame correctly rejects 3rd throw');
  }
}

// Test 8: Max pin validation - can't throw more than remaining pins
{
  const frames = createEmptyFrames();
  const f2 = addThrow(frames, 0, 4);
  try {
    addThrow(f2, 0, 3); // only 2 remain
    console.log('FAIL - should reject throw exceeding remaining pins');
    process.exitCode = 1;
  } catch (e) {
    console.log('PASS - correctly rejects throw exceeding remaining pins (4 then max 2)');
  }
}

console.log('\nAll tests executed.');

// Test 9: 10th frame strike, then 4, then 1 (not a strike on throw 2) -> sum raw = 6+4+1=11
// Strike-bonus rule says: frame score = 6 (strike) + 4 + 1 (next two throws) = 11. Same answer - confirms equivalence.
{
  const throwsList = [];
  for (let f = 0; f < 9; f++) { throwsList.push([f, 0]); throwsList.push([f, 0]); }
  throwsList.push([9, 6]); throwsList.push([9, 4]); throwsList.push([9, 1]);
  const frames = play(throwsList);
  const scores = computeScores(frames);
  assertEqual(scores[9].score, 11, '10th frame strike + 4 + 1 (sum-raw equivalence check)');
}

// Test 10: 10th frame spare (4,2) then bonus throw of 5 -> sum raw = 4+2+5=11
// Spare-bonus rule says: 6 (spare) + 5 (next throw) = 11. Confirms equivalence.
{
  const throwsList = [];
  for (let f = 0; f < 9; f++) { throwsList.push([f, 0]); throwsList.push([f, 0]); }
  throwsList.push([9, 4]); throwsList.push([9, 2]); throwsList.push([9, 5]);
  const frames = play(throwsList);
  const scores = computeScores(frames);
  assertEqual(scores[9].score, 11, '10th frame spare + bonus 5 (sum-raw equivalence check)');
}
