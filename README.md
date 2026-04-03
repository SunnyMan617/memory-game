# Documentation

A web-based card matching game built with **React** (frontend), **Node.js + Express** (backend), and **MongoDB + Mongoose** (database).

Flip cards two at a time to find matching emoji pairs. Track your moves, race the clock, and compete on the leaderboard!

---

## Table of Contents

1. [Game Overview](#-game-overview)
2. [Features](#-features)
3. [Project Structure](#-project-structure)
4. [Getting Started](#-getting-started)
5. [Frontend - Code Explained](#-frontend--code-explained)
   - [App.js - Central Game Logic](#appjs--central-game-logic)
   - [Card.js - Individual Card Component](#cardjs--individual-card-component)
   - [Board.js - The Grid Layout](#boardjs--the-grid-layout)
   - [Header.js - Stats Display](#headerjs--stats-display)
   - [DifficultySelector.js - Difficulty Modes](#difficultyselectorjs--difficulty-modes)
   - [ScoreBoard.js - Leaderboard](#scoreboardjs--leaderboard)
   - [GameOver.js - Victory Screen](#gameoverjs--victory-screen)
6. [CSS - Styling & Animations Explained](#-css--styling--animations-explained)
7. [Backend - Code Explained](#-backend--code-explained)
   - [app.js - Express Server](#appjs--express-server)
   - [config/db.js - MongoDB Connection](#configdbjs--mongodb-connection)
   - [models/Score.js - Mongoose Schema](#modelsscorejs--mongoose-schema)
   - [routes/scores.js - REST API Routes](#routesscoresjs--rest-api-routes)
8. [API Reference](#-api-reference)
9. [How the Game Works - Step by Step](#-how-the-game-works--step-by-step)
10. [Tech Stack Summary](#-tech-stack-summary)
11. [Bonus Features](#-bonus-features)

---

## 🎮 Game Overview

Memory (also known as "Concentration") is a classic card game where all cards are laid face down and the player flips two cards at a time trying to find matching pairs. The game tests your short-term memory - the fewer moves you need, the better your score.

**Our implementation features:**
- A 4×4 grid of 16 cards (8 matching emoji pairs) by default
- Smooth 3D flip animations using CSS `transform: rotateY()`
- Real-time move counter and timer
- Three difficulty levels that change the grid size
- A full score-saving system with MongoDB persistence
- A leaderboard showing the top 5 players

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Game Board** | Dynamic grid: 12 cards (Easy), 16 cards (Medium), 20 cards (Hard) |
| **Card Flip** | 3D CSS perspective transform with `rotateY(180deg)` |
| **Match Logic** | Emoji comparison - matched pairs stay face-up, mismatches flip back after 1 second |
| **Move Counter** | Increments each time two cards are flipped (1 attempt = 1 move) |
| **Timer** | Starts on first card click, stops when all pairs are found |
| **Difficulty Modes** | Easy (6 pairs / 4×3), Medium (8 pairs / 4×4), Hard (10 pairs / 5×4) |
| **Score Saving** | POST to backend API → stored in MongoDB with username, moves, time, difficulty |
| **Leaderboard** | GET from backend API → top 5 sorted by fewest moves, then fastest time |
| **Victory Animation** | 50 CSS-animated confetti pieces fall from the top of the screen |
| **Responsive** | Fully playable on mobile - grid and buttons adapt to screen width |
| **Error Handling** | Network failures, validation errors, empty username - all handled gracefully |

---

## 📁 Project Structure

```
memory-game/
│
├── frontend/                          # ← React application
│   ├── public/
│   │   └── index.html                 # HTML shell, font imports
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.js               # Renders the card grid
│   │   │   ├── Card.js                # Single card with flip logic
│   │   │   ├── DifficultySelector.js  # Easy / Medium / Hard buttons
│   │   │   ├── GameOver.js            # Victory screen + save form
│   │   │   ├── Header.js              # Logo + move counter + timer
│   │   │   └── ScoreBoard.js          # Leaderboard table
│   │   ├── styles/
│   │   │   └── index.css              # All styles & animations
│   │   ├── App.js                     # ⭐ Central game state + logic
│   │   └── index.js                   # React DOM entry point
│   ├── .env                           # REACT_APP_API_URL
│   └── package.json
│
├── backend/                           # ← Express API server
│   ├── config/
│   │   └── db.js                      # MongoDB connection via Mongoose
│   ├── models/
│   │   └── Score.js                   # Mongoose schema definition
│   ├── routes/
│   │   └── scores.js                  # GET /scores & POST /scores
│   ├── app.js                         # Express setup + middleware
│   ├── .env                           # PORT, MONGO_URI
│   └── package.json
│
├── .gitignore
└── README.md                          # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 16 | Runtime for both frontend and backend |
| npm | ≥ 8 | Package manager |
| MongoDB | ≥ 6 | Database (local install or MongoDB Atlas) |

### Step 1 - Clone the repository

```bash
git clone https://github.com/your-username/memory-game.git
cd memory-game
```

### Step 2 - Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas (cloud):**
Edit `backend/.env`:
```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/memory-game
```

### Step 3 - Start the backend

```bash
cd backend
npm install
npm run dev        # starts with nodemon (auto-restart on changes)
# or
npm start          # starts with plain node
```

The API runs at **http://localhost:5000**. You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

### Step 4 - Start the frontend

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**. The `proxy` field in `package.json` forwards API calls to port 5000 during development.

---

## ⚛️ Frontend - Code Explained

### App.js - Central Game Logic

`App.js` is the **brain** of the game. It holds all state and orchestrates every interaction. Here is what each piece does:

#### Constants & Helpers

```javascript
const EMOJI_SETS = {
  easy:   ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻'],          // 6 pairs → 12 cards
  medium: ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻', '🐼', '🐸'],  // 8 pairs → 16 cards
  hard:   ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁'], // 10 pairs → 20 cards
};
```

Each difficulty level defines its own set of emojis. The number of emojis determines how many pairs (and therefore total cards) appear on the board.

```javascript
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

This is the **Fisher-Yates shuffle algorithm** - the standard way to randomly reorder an array with uniform distribution. Every possible arrangement of cards is equally likely.

```javascript
function createCards(difficulty) {
  const emojis = EMOJI_SETS[difficulty];
  const pairs = [...emojis, ...emojis];    // duplicate to create pairs
  return shuffleArray(pairs).map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));
}
```

`createCards` builds the full deck: it takes the emoji set, duplicates it (so each emoji appears twice), shuffles the result, and wraps each in a card object with tracking properties.

#### State Variables

```javascript
const [difficulty, setDifficulty] = useState('medium');     // current difficulty
const [cards, setCards] = useState(() => createCards('medium')); // the card deck
const [flippedCards, setFlippedCards] = useState([]);        // currently face-up cards (0-2)
const [moves, setMoves] = useState(0);                      // move counter
const [gameWon, setGameWon] = useState(false);               // win flag
const [isLocked, setIsLocked] = useState(false);             // prevents clicks during flip-back
const [showLeaderboard, setShowLeaderboard] = useState(false);
const [timer, setTimer] = useState(0);                       // seconds elapsed
const [isTimerRunning, setIsTimerRunning] = useState(false);
const timerRef = useRef(null);                               // stores setInterval reference
```

Key design decisions:
- `isLocked` prevents the player from clicking more cards while the 1-second "flip back" animation is running.
- `flippedCards` holds references to at most 2 card objects - once it reaches 2, matching logic triggers.
- `timerRef` uses `useRef` (not state) because it stores a `setInterval` ID that does not need to trigger re-renders.

#### Effect 1 - Timer

```javascript
useEffect(() => {
  if (isTimerRunning) {
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  }
  return () => clearInterval(timerRef.current);
}, [isTimerRunning]);
```

When `isTimerRunning` becomes `true`, a `setInterval` ticks the timer every second. The cleanup function (`return () => ...`) stops the interval when the component unmounts or the timer stops.

#### Effect 2 - Win Detection

```javascript
useEffect(() => {
  if (cards.length > 0 && cards.every((card) => card.isMatched)) {
    setGameWon(true);
    setIsTimerRunning(false);
  }
}, [cards]);
```

Every time the `cards` array updates, this effect checks whether **every** card has `isMatched: true`. If so, the game is won and the timer stops.

#### Effect 3 - Matching Logic (Core Game Engine)

```javascript
useEffect(() => {
  if (flippedCards.length === 2) {
    setIsLocked(true);                        // lock the board
    setMoves((prev) => prev + 1);             // count this attempt

    const [first, second] = flippedCards;
    if (first.emoji === second.emoji) {
      // ✅ MATCH - mark both cards as matched
      setCards((prev) =>
        prev.map((card) =>
          card.id === first.id || card.id === second.id
            ? { ...card, isMatched: true }
            : card
        )
      );
      setFlippedCards([]);
      setIsLocked(false);                     // unlock immediately
    } else {
      // ❌ NO MATCH - wait 1 second, then flip both back
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.id === first.id || card.id === second.id
              ? { ...card, isFlipped: false }
              : card
          )
        );
        setFlippedCards([]);
        setIsLocked(false);                   // unlock after flip-back
      }, 1000);
    }
  }
}, [flippedCards]);
```

This is the **heart of the game**. When exactly 2 cards are flipped:
1. The board is **locked** (`isLocked = true`) to prevent more clicks.
2. The **move counter** increments.
3. If the emojis match → both cards get `isMatched: true` and stay face-up permanently.
4. If they do not match → after a 1-second delay, both cards flip back to face-down.

#### handleCardClick

```javascript
const handleCardClick = useCallback((card) => {
  // Guard: ignore clicks when locked, already flipped, already matched, or 2 already flipped
  if (isLocked || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

  // Start the timer on the very first card click
  if (!isTimerRunning && moves === 0 && flippedCards.length === 0) {
    setIsTimerRunning(true);
  }

  // Flip this card face-up
  setCards((prev) =>
    prev.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c))
  );
  setFlippedCards((prev) => [...prev, card]);
}, [isLocked, flippedCards, isTimerRunning, moves]);
```

`useCallback` memoizes this function so it does not get recreated on every render (performance optimization for the 16+ Card components). The guard clause at the top prevents invalid clicks.

#### handleSaveScore

```javascript
const handleSaveScore = async (pseudo) => {
  try {
    const response = await fetch(`${API_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, coups: moves, difficulty, time: timer }),
    });
    const data = await response.json();
    if (data.success) setShowLeaderboard(true);
    return data;
  } catch (error) {
    return { success: false, message: 'Network error - could not save score.' };
  }
};
```

This sends the player's score to the backend via `POST /scores`. The `try/catch` handles network failures gracefully and returns an error message the UI can display.

---

### Card.js - Individual Card Component

```javascript
function Card({ card, onClick }) {
  const classNames = [
    'card',
    isFlipped || isMatched ? 'card--flipped' : '',
    isMatched ? 'card--matched' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={() => onClick(card)}>
      <div className="card-inner">
        <div className="card-front">          {/* The "?" face */}
          <span className="card-question">?</span>
        </div>
        <div className="card-back">           {/* The emoji face */}
          <span className="card-emoji">{emoji}</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Card);
```

**How the 3D flip works:**
- `.card-inner` has `transform-style: preserve-3d` so its children exist in 3D space.
- `.card-front` and `.card-back` both have `backface-visibility: hidden` - the back of each face is invisible.
- `.card-back` is pre-rotated with `transform: rotateY(180deg)` so it faces away.
- When `card--flipped` is added, `.card-inner` rotates 180°, hiding the front and revealing the back.

**`React.memo`** wraps the component to prevent unnecessary re-renders. A card only re-renders if its `card` prop actually changes, not when sibling cards change.

**CSS classes used (BEM naming):**
- `card` - base class
- `card--flipped` - triggers the 180° rotation
- `card--matched` - adds a green glow border and disables pointer events

---

### Board.js - The Grid Layout

```javascript
function Board({ cards, onCardClick, gridCols }) {
  return (
    <div className="board" style={{ '--grid-cols': gridCols }}>
      {cards.map((card) => (
        <Card key={card.id} card={card} onClick={onCardClick} />
      ))}
    </div>
  );
}
```

The board is a CSS Grid container. The number of columns is passed as a **CSS custom property** (`--grid-cols`), which the CSS uses:

```css
.board {
  grid-template-columns: repeat(var(--grid-cols, 4), 1fr);
}
```

This makes the grid dynamic: 4 columns for Easy/Medium, 5 columns for Hard - no extra CSS classes needed.

---

### Header.js - Stats Display

```javascript
function Header({ moves, timer }) {
  return (
    <header className="header">
      <h1 className="logo">🧠 Memory</h1>
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
    </header>
  );
}
```

A sticky header with `backdrop-filter: blur(16px)` for a frosted glass effect. The `formatTime` helper converts seconds to `MM:SS` format.

---

### DifficultySelector.js - Difficulty Modes

```javascript
const DIFFICULTIES = [
  { key: 'easy', label: 'Easy', pairs: 6 },
  { key: 'medium', label: 'Medium', pairs: 8 },
  { key: 'hard', label: 'Hard', pairs: 10 },
];
```

Each button shows the label and the total card count (pairs × 2). Clicking a difficulty calls `handleNewGame(difficultyKey)` in `App.js`, which regenerates the entire card deck.

---

### ScoreBoard.js - Leaderboard

```javascript
useEffect(() => {
  const fetchScores = async () => {
    const response = await fetch(`${apiUrl}/scores?difficulty=${difficulty}`);
    const data = await response.json();
    setScores(data);
  };
  fetchScores();
}, [apiUrl, difficulty]);
```

On mount (and whenever `difficulty` changes), this component fetches the top 5 scores from the backend. It handles three states: **loading**, **error** (backend unreachable), and **empty** (no scores yet).

Scores are displayed in a grid with medal emojis (🥇🥈🥉) for the top 3.

---

### GameOver.js - Victory Screen

This component appears when `gameWon === true`. It has four responsibilities:

1. **Confetti Animation** - 50 `<div>` elements with randomized CSS custom properties (`--x`, `--delay`, `--duration`, `--color`) that fall from the top of the screen. Auto-removes after 5 seconds.

2. **Final Stats** - Displays the total moves and time in large monospace numbers.

3. **Score Save Form** - A text input for the username and a "Save Score" button. Handles empty input, saving state, network errors, and success feedback.

4. **Leaderboard** - After saving, the `ScoreBoard` component renders below so the player can see their ranking.

---

## 🎨 CSS - Styling & Animations Explained

### Design System (CSS Variables)

```css
:root {
  --bg-primary: #0f0f23;        /* deep navy background */
  --bg-secondary: #1a1a36;      /* slightly lighter panels */
  --bg-card: #252547;            /* card face-down background */
  --accent: #6c5ce7;             /* purple - primary interactive color */
  --accent-light: #a29bfe;       /* lighter purple for text highlights */
  --success: #00b894;            /* green - matched cards */
  --font-display: 'Fredoka';    /* rounded, playful headings */
  --font-mono: 'Space Mono';    /* monospace for numbers/stats */
}
```

The entire color scheme uses two custom font families loaded from Google Fonts in `index.html`.

### Card Flip Animation

The 3D flip relies on three CSS properties working together:

```css
.card {
  perspective: 600px;                /* creates the 3D viewing angle */
}

.card-inner {
  transform-style: preserve-3d;     /* children exist in 3D space */
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card--flipped .card-inner {
  transform: rotateY(180deg);        /* flip! */
}

.card-front, .card-back {
  backface-visibility: hidden;       /* hide the reverse side of each face */
}

.card-back {
  transform: rotateY(180deg);        /* pre-rotated so it shows when inner flips */
}
```

**Why `cubic-bezier(0.4, 0, 0.2, 1)`?** This is the Material Design "standard easing" curve - it starts fast, decelerates smoothly, and feels natural.

### Match Pulse Animation

```css
@keyframes matchPulse {
  0%  { transform: scale(1);   }
  30% { transform: scale(1.1); }     /* quick "pop" effect */
  100%{ transform: scale(1);   }
}

.card--matched .card-back {
  border-color: var(--success);
  box-shadow: 0 0 20px var(--success-glow);
  animation: matchPulse 0.5s ease-out;
}
```

When a pair is found, the cards briefly "pop" larger (scale to 1.1) and gain a green glowing border.

### Confetti Animation

```css
.confetti-piece {
  position: absolute;
  top: -20px;
  left: var(--x);                    /* random horizontal position */
  animation: confettiFall var(--duration) var(--delay) ease-out forwards;
}

@keyframes confettiFall {
  0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
}
```

Each confetti piece gets randomized CSS variables from React (`--x`, `--delay`, `--duration`, `--color`), making each piece unique.

### Responsive Breakpoint

```css
@media (max-width: 520px) {
  html { font-size: 14px; }      /* shrinks everything proportionally */
  .board { gap: 8px; }
  .card-emoji { font-size: 2rem; }
}
```

Since most sizing uses `rem` units, reducing the root font size at 520px shrinks the entire UI proportionally for mobile screens.

---

## 🖥 Backend - Code Explained

### app.js - Express Server

```javascript
require('dotenv').config();              // load .env variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const scoresRouter = require('./routes/scores');

const app = express();

connectDB();                              // connect to MongoDB

app.use(cors());                          // allow cross-origin requests
app.use(express.json());                  // parse JSON request bodies
app.use('/scores', scoresRouter);         // mount routes at /scores

app.listen(PORT, () => { ... });
```

**Key middleware:**
- **`cors()`** - without this, the browser blocks requests from `localhost:3000` to `localhost:5000` (different ports = different origins).
- **`express.json()`** - parses the `Content-Type: application/json` body from the frontend `fetch()` calls.

---

### config/db.js - MongoDB Connection

```javascript
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/memory-game';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);          // exit if DB connection fails - cannot run without it
  }
};
```

Falls back to a local MongoDB URI if no environment variable is set. Calls `process.exit(1)` on failure because the API is useless without a database.

---

### models/Score.js - Mongoose Schema

```javascript
const ScoreSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,                         // removes leading/trailing whitespace
    maxlength: [20, 'Username cannot exceed 20 characters'],
  },
  coups: {
    type: Number,
    required: [true, 'Number of moves is required'],
    min: [8, 'Minimum possible moves is 8'],   // 8 pairs = 8 perfect moves
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],    // only these three values allowed
    default: 'medium',
  },
  time: {
    type: Number,                         // seconds
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,                    // auto-set on creation
  },
});
```

**Validation highlights:**
- `min: 8` on `coups` because with 8 pairs, the theoretical minimum is 8 moves (every guess is correct).
- `enum` on `difficulty` prevents garbage values from being stored.
- `trim: true` ensures "  Alice  " becomes "Alice".
- Custom error messages (e.g., `'Username is required'`) are returned to the frontend.

---

### routes/scores.js - REST API Routes

#### GET /scores - Retrieve the leaderboard

```javascript
router.get('/', async (req, res) => {
  const { difficulty } = req.query;             // optional filter
  const filter = difficulty ? { difficulty } : {};
  const scores = await Score.find(filter)
    .sort({ coups: 1, time: 1, date: -1 })     // fewest moves → fastest time → most recent
    .limit(5)                                    // top 5 only
    .select('pseudo coups difficulty time date'); // exclude _id, __v
  res.json(scores);
});
```

**Sort order:** `{ coups: 1, time: 1, date: -1 }` means:
1. Fewest moves first (ascending)
2. If tied on moves, fastest time first (ascending)
3. If still tied, most recent first (descending)

#### POST /scores - Save a new score

```javascript
router.post('/', async (req, res) => {
  const { pseudo, coups, difficulty, time } = req.body;

  // Manual validation before Mongoose
  if (!pseudo || !coups) {
    return res.status(400).json({ success: false, message: '...' });
  }

  const score = new Score({ pseudo: pseudo.trim(), coups, difficulty, time });
  await score.save();
  res.status(201).json({ success: true, message: 'Score saved' });
});
```

**Error handling has two layers:**
1. Manual check - catches missing fields before Mongoose.
2. Mongoose validation - catches type errors, out-of-range values, and invalid enums. The `catch` block formats Mongoose validation errors into user-friendly messages.

---

## 🔌 API Reference

### GET /scores

Returns the top 5 scores, optionally filtered by difficulty.

**URL:** `http://localhost:5000/scores?difficulty=medium`

**Response (200):**
```json
[
  { "pseudo": "Alice",   "coups": 12, "difficulty": "medium", "time": 45, "date": "2025-01-15T10:30:00Z" },
  { "pseudo": "Bob",     "coups": 14, "difficulty": "medium", "time": 62, "date": "2025-01-14T14:20:00Z" },
  { "pseudo": "Charlie", "coups": 15, "difficulty": "medium", "time": 38, "date": "2025-01-13T09:15:00Z" }
]
```

### POST /scores

Saves a new score to the database.

**URL:** `http://localhost:5000/scores`

**Request body:**
```json
{
  "pseudo": "David",
  "coups": 18,
  "difficulty": "medium",
  "time": 73
}
```

**Success Response (201):**
```json
{ "success": true, "message": "Score saved" }
```

**Validation Error (400):**
```json
{ "success": false, "message": "Username is required" }
```

**Server Error (500):**
```json
{ "success": false, "message": "Failed to save score" }
```

---

## 🔄 How the Game Works - Step by Step

Here is the complete flow from start to finish:

```
1. PAGE LOAD
   └─ App.js initializes with createCards('medium')
      └─ 8 emojis duplicated → 16 items → Fisher-Yates shuffled
      └─ Each card: { id, emoji, isFlipped: false, isMatched: false }

2. PLAYER CLICKS CARD #1
   └─ handleCardClick fires
      ├─ Guard clause: not locked, not already flipped/matched
      ├─ Timer starts (first click only)
      ├─ Card state: isFlipped → true  (CSS transition triggers flip)
      └─ flippedCards: [card1]

3. PLAYER CLICKS CARD #2
   └─ handleCardClick fires again
      ├─ Card state: isFlipped → true
      └─ flippedCards: [card1, card2]  →  triggers matching effect

4. MATCHING EFFECT (useEffect on flippedCards)
   ├─ Board is LOCKED (isLocked = true)
   ├─ moves += 1
   │
   ├─ IF card1.emoji === card2.emoji  (MATCH!)
   │   ├─ Both cards: isMatched → true
   │   ├─ CSS: green glow + pulse animation
   │   ├─ flippedCards → []
   │   └─ Board UNLOCKED immediately
   │
   └─ IF card1.emoji !== card2.emoji  (NO MATCH)
       ├─ setTimeout(1000ms)
       ├─ Both cards: isFlipped → false  (CSS transition flips back)
       ├─ flippedCards → []
       └─ Board UNLOCKED after 1 second

5. WIN CHECK (useEffect on cards)
   └─ If ALL cards have isMatched === true:
       ├─ gameWon → true
       ├─ Timer stops
       └─ GameOver component renders (confetti + save form)

6. SCORE SAVING
   ├─ Player types username in input
   ├─ Clicks "Save Score"
   ├─ Frontend sends POST /scores { pseudo, coups, difficulty, time }
   ├─ Backend validates + saves to MongoDB
   └─ Leaderboard re-fetches and displays updated top 5

7. NEW GAME
   └─ handleNewGame resets all state:
       cards, flippedCards, moves, timer, gameWon, isLocked → initial values
```

---

## 🛠 Tech Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 | Component-based UI, hooks for state management |
| **Styling** | Pure CSS3 | 3D transforms, keyframe animations, CSS Grid, custom properties |
| **Fonts** | Fredoka + Space Mono | Playful display font + clean monospace for stats |
| **Backend** | Node.js + Express | Lightweight REST API, easy async/await |
| **Database** | MongoDB + Mongoose | Flexible document store with schema validation |
| **Dev Tools** | nodemon | Hot-reload for backend during development |

---

## 🎁 Bonus Features

| Bonus | Status | Details |
|-------|--------|---------|
| Victory Animation | ✅ | 50 CSS confetti pieces with randomized physics |
| Difficulty Selection | ✅ | Easy (12 cards), Medium (16), Hard (20) |
| Timer | ✅ | Starts on first click, saved with score |
| Error Handling | ✅ | Network errors, validation, empty input |
| Responsive Design | ✅ | Mobile-optimized at 520px breakpoint |
| Performance | ✅ | `React.memo` on Card, `useCallback` on handlers |

---

## 📄 License

MIT 
