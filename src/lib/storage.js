// Local-storage persistence for game history.
// Each saved game: { id, date, players: [{ name, frames, finalScore }] }

const STORAGE_KEY = 'sixpin-bowling-history-v1';
const MAX_HISTORY = 4; // keep last 4 games

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveGame(game) {
  const history = loadHistory();
  const updated = [game, ...history].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage full or unavailable - fail silently, game still shown in-session
  }
  return updated;
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Rolling average per player across saved games (most recent MAX_HISTORY).
export function computeAverages(history) {
  const totals = {}; // name -> { sum, count }
  history.forEach((game) => {
    game.players.forEach((p) => {
      if (!totals[p.name]) totals[p.name] = { sum: 0, count: 0 };
      totals[p.name].sum += p.finalScore;
      totals[p.name].count += 1;
    });
  });
  return Object.entries(totals).map(([name, { sum, count }]) => ({
    name,
    average: Math.round((sum / count) * 10) / 10,
    gamesPlayed: count,
  }));
}
