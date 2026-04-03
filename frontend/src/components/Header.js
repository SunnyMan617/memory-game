import React from 'react';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function Header({ moves, timer }) {
  return (
    <header className="header">
      <div className="header-inner">
        <h1 className="logo">
          <span className="logo-text">Memory</span>
        </h1>
        <div className="stats">
          <div className="stat-pill">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(timer)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
