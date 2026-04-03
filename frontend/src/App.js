import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import ScoreBoard from './components/ScoreBoard';
import GameOver from './components/GameOver';
import DifficultySelector from './components/DifficultySelector';
import Header from './components/Header';

const EMOJI_SETS = {
  easy:   ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻'],
  medium: ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻', '🐼', '🐸'],
  hard:   ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁'],
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(difficulty) {
  const emojis = EMOJI_SETS[difficulty];
  const pairs = [...emojis, ...emojis];
  return shuffleArray(pairs).map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
}

function App() {
  const [difficulty, setDifficulty] = useState('medium');
  const [cards, setCards] = useState(() => createCards('medium'));
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // Check for win condition
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameWon(true);
      setIsTimerRunning(false);
    }
  }, [cards]);

  // Handle matching logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsLocked(true);
      setMoves((prev) => prev + 1);

      const [first, second] = flippedCards;
      if (first.emoji === second.emoji) {
        // Match found
        setCards((prev) =>
          prev.map((card) =>
            card.id === first.id || card.id === second.id
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedCards([]);
        setIsLocked(false);
      } else {
        // No match — flip back after delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first.id || card.id === second.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  }, [flippedCards]);

  const handleCardClick = useCallback(
    (card) => {
      if (isLocked || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

      // Start timer on first card click
      if (!isTimerRunning && moves === 0 && flippedCards.length === 0) {
        setIsTimerRunning(true);
      }

      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c))
      );
      setFlippedCards((prev) => [...prev, card]);
    },
    [isLocked, flippedCards, isTimerRunning, moves]
  );

  const handleNewGame = useCallback(
    (newDifficulty) => {
      const diff = newDifficulty || difficulty;
      setDifficulty(diff);
      setCards(createCards(diff));
      setFlippedCards([]);
      setMoves(0);
      setGameWon(false);
      setIsLocked(false);
      setTimer(0);
      setIsTimerRunning(false);
      clearInterval(timerRef.current);
    },
    [difficulty]
  );

  const handleSaveScore = async (pseudo) => {
    try {
      const response = await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo,
          coups: moves,
          difficulty,
          time: timer,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowLeaderboard(true);
      }
      return data;
    } catch (error) {
      console.error('Error saving score:', error);
      return { success: false, message: 'Network error — could not save score.' };
    }
  };

  const gridCols = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 4 : 5;

  return (
    <div className="app">
      <div className="game-bg" />
      <Header moves={moves} timer={timer} />

      <main className="main-content">
        {!gameWon ? (
          <>
            <div className="controls-bar">
              <DifficultySelector
                difficulty={difficulty}
                onChange={handleNewGame}
              />
              <button className="btn btn-new-game" onClick={() => handleNewGame()}>
                <span className="btn-icon">🔄</span> New Game
              </button>
            </div>

            <Board
              cards={cards}
              onCardClick={handleCardClick}
              gridCols={gridCols}
            />

            <button
              className="btn btn-leaderboard"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              <span className="btn-icon">🏆</span>
              {showLeaderboard ? 'Hide Leaderboard' : 'Leaderboard'}
            </button>

            {showLeaderboard && (
              <ScoreBoard apiUrl={API_URL} difficulty={difficulty} />
            )}
          </>
        ) : (
          <GameOver
            moves={moves}
            timer={timer}
            difficulty={difficulty}
            onSaveScore={handleSaveScore}
            onNewGame={() => handleNewGame()}
            apiUrl={API_URL}
          />
        )}
      </main>
    </div>
  );
}

export default App;
