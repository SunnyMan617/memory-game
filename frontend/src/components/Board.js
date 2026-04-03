import React from 'react';
import Card from './Card';

function Board({ cards, onCardClick, gridCols }) {
  return (
    <div
      className="board"
      style={{ '--grid-cols': gridCols }}
    >
      {cards.map((card) => (
        <Card key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  );
}

export default Board;
