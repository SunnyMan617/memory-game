import React, { useState, useEffect } from 'react';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const MEDALS = ['🥇', '🥈', '🥉', '4', '5'];

function ScoreBoard({ apiUrl, difficulty }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${apiUrl}/scores?difficulty=${difficulty}`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setScores(data);
      } catch (err) {
        setError('Could not load leaderboard. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [apiUrl, difficulty]);

  return (
    <div className="scoreboard">
      <h2 className="scoreboard-title">
        <span>🏆</span> Leaderboard
        <span className="scoreboard-badge">{difficulty}</span>
      </h2>

      {loading && <p className="scoreboard-msg">Loading scores...</p>}
      {error && <p className="scoreboard-msg scoreboard-msg--error">{error}</p>}

      {!loading && !error && scores.length === 0 && (
        <p className="scoreboard-msg">No scores yet. Be the first!</p>
      )}

      {!loading && !error && scores.length > 0 && (
        <div className="scoreboard-table">
          <div className="scoreboard-row scoreboard-row--header">
            <span>#</span>
            <span>Player</span>
            <span>Moves</span>
            <span>Time</span>
          </div>
          {scores.map((score, i) => (
            <div key={score._id || i} className="scoreboard-row">
              <span className="scoreboard-rank">{MEDALS[i]}</span>
              <span className="scoreboard-name">{score.pseudo}</span>
              <span className="scoreboard-moves">{score.coups}</span>
              <span className="scoreboard-time">{formatTime(score.time)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ScoreBoard;
