import React from 'react';

const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', pairs: 6 },
  { key: 'medium', label: 'Medium', pairs: 8 },
  { key: 'hard', label: 'Hard', pairs: 10 },
];

function DifficultySelector({ difficulty, onChange }) {
  return (
    <div className="difficulty-selector">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.key}
          className={`btn btn-difficulty ${difficulty === d.key ? 'btn-difficulty--active' : ''}`}
          onClick={() => onChange(d.key)}
          title={`${d.pairs} pairs`}
        >
          {d.label}
          <span className="difficulty-pairs">{d.pairs * 2}</span>
        </button>
      ))}
    </div>
  );
}

export default DifficultySelector;
