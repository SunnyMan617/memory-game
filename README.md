# Memory Game

A browser-based **Concentration** card game: flip two cards at a time to match emoji pairs. Track moves and time, save scores to **MongoDB**, and view a per-difficulty leaderboard.

**Stack:** React (frontend), Node.js + Express (API), MongoDB + Mongoose (database).

---

## Quick start

| Requirement | Notes |
|---------------|--------|
| Node.js | ≥ 16 |
| npm | ≥ 8 |
| MongoDB | Local install or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |

**1. Clone and install**

```bash
git clone https://github.com/your-username/memory-game.git
cd memory-game
```

**2. Database**

- **Local:** run `mongod` (or your OS service), or  
- **Atlas:** set `MONGO_URI` in `backend/.env` (see [Configuration](#configuration)).

**3. Backend** (from repo root)

```bash
cd backend
cp .env.example .env   # edit MONGO_URI if needed
npm install
npm run dev              # or: npm start
```

API: **http://localhost:5000** — expect logs: MongoDB connected, server listening.

**4. Frontend** (second terminal)

```bash
cd frontend
cp .env.example .env     # optional; defaults work with proxy
npm install
npm start
```

App: **http://localhost:3000**. During development, `frontend/package.json` sets `"proxy": "http://localhost:5000"` so API calls can use relative URLs.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [API](#api)
- [Game flow](#game-flow)
- [License](#license)

---

## Overview

Players see a shuffled grid of face-down cards. Each click flips one card; after two flips, a matching pair stays face-up, or both flip back after one second. The default board is **Medium**: 8 pairs (16 cards) on a 4×4 grid. **Easy** uses 6 pairs (12 cards, 4×3); **Hard** uses 10 pairs (20 cards, 5×4).

The UI includes a move counter, timer (starts on first flip), difficulty selector, victory screen with optional score save, and a leaderboard (top 5 per difficulty).

---

## Features

| Area | What it does |
|------|----------------|
| Board | Dynamic grid via CSS variable `--grid-cols` (see `Board.js` + `index.css`) |
| Cards | 3D flip (`rotateY`), match glow; `React.memo` on `Card` |
| Logic | State in `App.js`: deck, two flipped cards, lock during mismatch delay, win detection |
| Scores | `POST /scores` persists username (`pseudo`), moves (`coups`), difficulty, time (seconds) |
| Leaderboard | `GET /scores?difficulty=` returns top 5: fewest moves, then fastest time, then newest |
| UX | Loading/error/empty states on leaderboard; validation and network errors on save |
| Responsive | Breakpoint around 520px width (smaller type, tighter grid) |

---

## Project structure

At the repository root: `frontend/`, `backend/`, `.gitignore`, `LICENSE`, and `README.md`.

### Frontend (`frontend/`)

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js                 # Game state, matching logic, API calls
│   ├── index.js
│   ├── components/
│   │   ├── Board.js
│   │   ├── Card.js
│   │   ├── DifficultySelector.js
│   │   ├── GameOver.js        # Victory UI, save form, CSS confetti
│   │   ├── Header.js
│   │   └── ScoreBoard.js
│   └── styles/
│       └── index.css
├── .env.example
└── package.json
```

### Backend (`backend/`)

```
backend/
├── config/
│   └── db.js
├── models/
│   └── Score.js
├── routes/
│   └── scores.js
├── app.js
├── .env.example
└── package.json
```

---

## Configuration

| File | Purpose |
|------|---------|
| `backend/.env` | `PORT` (default 5000), `MONGO_URI` (falls back to `mongodb://localhost:27017/memory-game` in `config/db.js` if unset) |
| `frontend/.env` | `REACT_APP_API_URL` — optional; defaults to `http://localhost:5000` in `App.js` if not set |

Copy from each folder’s `.env.example` and adjust for your machine or Atlas cluster.

---

## Architecture

### Frontend (`frontend/src`)

- **`App.js`** — Emoji sets per difficulty, Fisher–Yates shuffle, `createCards()`, `handleCardClick` (with `useCallback`), effects for timer, win check, and pair matching (lock board, increment moves, match or delayed flip-back).
- **`Card.js`** — BEM classes: `card`, `card--flipped`, `card--matched`; front/back faces with `backface-visibility` and inner `rotateY` for the flip.
- **`Board.js`** — Maps cards to `Card`; passes `gridCols` as `--grid-cols`.
- **`ScoreBoard.js`** — Fetches `/scores?difficulty=…` when difficulty changes.
- **`GameOver.js`** — Stats, username save, optional leaderboard after success; confetti hides after 5s.

### Styling (`frontend/src/styles/index.css`)

CSS variables define colors and fonts (Fredoka, Space Mono from `index.html`). Card flip uses `perspective`, `preserve-3d`, and `cubic-bezier` on the inner element; matched pairs use a short scale pulse. Confetti uses keyframed fall with per-piece CSS variables.

### Backend (`backend/`)

- **`app.js`** — `cors`, `express.json`, mounts `/scores`.
- **`config/db.js`** — Mongoose connect; exits on failure.
- **`models/Score.js`** — Fields: `pseudo`, `coups`, `difficulty` (`easy` \| `medium` \| `hard`), `time`, `date`.
- **`routes/scores.js`** — `GET /` lists top 5; `POST /` creates a score with validation and error responses.

---

## API

Base URL (local): `http://localhost:5000`

### `GET /scores`

| Query | Description |
|-------|-------------|
| `difficulty` | Optional: `easy`, `medium`, or `hard` |

**200** — JSON array of objects with `pseudo`, `coups`, `difficulty`, `time`, `date` (sorted: `coups` asc, `time` asc, `date` desc).

### `POST /scores`

**Body (JSON):**

```json
{
  "pseudo": "Player1",
  "coups": 18,
  "difficulty": "medium",
  "time": 73
}
```

| Response | When |
|----------|------|
| **201** | `{ "success": true, "message": "..." }` |
| **400** | Validation / missing fields — `{ "success": false, "message": "..." }` |
| **500** | Server error |

Mongoose validates the document (e.g. username length, `coups` minimum per schema in `models/Score.js`).

---

## Game flow

```
Load → deck created for selected difficulty → first flip starts timer
     → second flip: one move counted; match or 1s flip-back
     → repeat until all pairs matched → GameOver → optional POST score → leaderboard
```

New game / difficulty change resets cards, moves, timer, and win state (see `handleNewGame` in `App.js`).

---

## License

This project is released under the [MIT License](LICENSE). See that file for the full terms.
