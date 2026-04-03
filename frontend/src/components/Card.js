import React from 'react';

function Card({ card, onClick }) {
  const { emoji, isFlipped, isMatched } = card;

  const classNames = [
    'card',
    isFlipped || isMatched ? 'card--flipped' : '',
    isMatched ? 'card--matched' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={() => onClick(card)}>
      <div className="card-inner">
        <div className="card-front">
          <span className="card-question">?</span>
        </div>
        <div className="card-back">
          <span className="card-emoji">{emoji}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Card);
