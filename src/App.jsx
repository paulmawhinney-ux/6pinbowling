import { useState } from 'react';
import PlayerSetup from './components/PlayerSetup';
import Game from './components/Game';
import History from './components/History';
import { loadHistory, saveGame } from './lib/storage';
import './App.css';

export default function App() {
  const [view, setView] = useState('setup'); // 'setup' | 'game' | 'history'
  const [playerNames, setPlayerNames] = useState([]);
  const [history, setHistory] = useState(() => loadHistory());

  function handleStartGame(names) {
    setPlayerNames(names);
    setView('game');
  }

  function handleGameComplete(game) {
    const updated = saveGame(game);
    setHistory(updated);
    setView('history');
  }

  function handleAbandon() {
    setView('setup');
  }

  return (
    <div className="app-root">
      {view === 'setup' && (
        <PlayerSetup onStart={handleStartGame} onViewHistory={() => setView('history')} />
      )}
      {view === 'game' && (
        <Game
          playerNames={playerNames}
          onGameComplete={handleGameComplete}
          onAbandon={handleAbandon}
        />
      )}
      {view === 'history' && (
        <History history={history} onBack={() => setView('setup')} />
      )}
    </div>
  );
}
