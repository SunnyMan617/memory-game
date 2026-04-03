import React, { useState, useEffect } from 'react';
import ScoreBoard from './ScoreBoard';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function GameOver({ moves, timer, difficulty, onSaveScore, onNewGame, apiUrl }) {
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onSaveScore(username.trim());
    setSaving(false);
    if (result.success) {
      setSaved(true);
    } else {
      setError(result.message || 'Failed to save score');
    }
  };

  return (
    <div className="game-over">
      {/* Simple CSS confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                '--x': `${Math.random() * 100}vw`,
                '--delay': `${Math.random() * 2}s`,
                '--duration': `${2 + Math.random() * 3}s`,
                '--color': ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b9d', '#c084fc'][
                  Math.floor(Math.random() * 6)
                ],
              }}
            />
          ))}
        </div>
      )}

      <div className="game-over-card">
        <div className="game-over-trophy">🎉</div>
        <h2 className="game-over-title">You Won!</h2>
        <div className="game-over-stats">
          <div className="game-over-stat">
            <span className="game-over-stat-value">{moves}</span>
            <span className="game-over-stat-label">moves</span>
          </div>
          <div className="game-over-stat-divider" />
          <div className="game-over-stat">
            <span className="game-over-stat-value">{formatTime(timer)}</span>
            <span className="game-over-stat-label">time</span>
          </div>
        </div>

        {!saved ? (
          <div className="save-score-form">
            <input
              type="text"
              className="save-score-input"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              maxLength={20}
              disabled={saving}
              autoFocus
            />
            <button
              className="btn btn-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Score'}
            </button>
            {error && <p className="save-error">{error}</p>}
          </div>
        ) : (
          <p className="save-success">✅ Score saved!</p>
        )}

        <button className="btn btn-new-game btn-new-game--large" onClick={onNewGame}>
          Play Again
        </button>

        {saved && <ScoreBoard apiUrl={apiUrl} difficulty={difficulty} />}
      </div>
    </div>
  );
}

export default GameOver;
