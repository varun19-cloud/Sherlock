# MindMaze — Interactive Detective Investigation Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Architecture: Decoupled](https://img.shields.io/badge/Architecture-REST%20%2B%20Vanilla%20JS-blue.svg)](docs/architecture.md)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-success.svg)](https://www.mongodb.com/)

**MindMaze** is a full-featured, browser-based detective investigation web application where players step into the shoes of an investigator to solve intricate, fictional mysteries. 

Rather than a static mockup, MindMaze delivers an authentic deduction experience: examine crime scenes with interactive hotspots, review suspect dossiers and testimonies, link clues with red thread on a drag-and-drop evidence board, chronologically reconstruct event timelines, maintain an encrypted detective notebook, request progressive hints, and submit formal accusations backed by evidence.

---

## 1. Features

### 🔍 Interactive Crime Scenes
- High-fidelity visual crime scenes rendered with responsive atmospheric SVG graphics.
- Interactive hotspots that reveal physical evidence, latent fingerprints, document fragments, and forensic traces when examined.
- Real-time clue discovery persistence with audio-visual notifications and XP awards.

### 👥 Suspect Dossiers & Interrogations
- Deep character backgrounds, stated alibis, hidden motives, and multiple statements.
- Dynamic disclosure: suspect testimony unlocks as related clues are unearthed.
- Zero client-side leakage: culprit identities and guilty flags are safeguarded on the server until case closure.

### 📌 Corkboard Evidence System
- Freeform drag-and-drop evidence cards on an authentic detective corkboard.
- Interactive red yarn string connections between clues with customizable deduction labels.
- Persistent board coordinate saving across browser sessions and devices.

### ⏱️ Chronological Crime Timeline
- Reconstruct the exact sequence of events leading up to and following the crime.
- Intuitive drag-and-drop ordering with immediate server-evaluated accuracy feedback.
- Bonus deduction scoring for flawless chronological reconstruction.

### 📝 Detective Notebook
- Fully featured personal investigative notebook.
- Color-coded categorization (amber, red, green, blue) for leads, alibi checks, and theories.
- Complete CRUD capabilities stored persistently per investigation session.

### 💡 Progressive Hint System
- Tiered, progressive hints that nudge players forward when stuck.
- Strategic XP deduction penalties per hint to balance challenge and reward.

### ⚖️ Server-Evaluated Accusations & Scoring
- Select the suspect and articulate your reasoning.
- Server-side deduction evaluation with detailed forensic score breakdowns (base score, clue discovery bonus, timeline bonus, speed bonus, and hint penalties).
- Full resolution breakdown upon case closure detailing the culprit's motive, method, and key incriminating evidence.

### 🏆 Detective Progression & Leaderboard
- XP progression across 5 detective tiers: *Rookie Detective* → *Junior Detective* → *Detective* → *Senior Detective* → *Chief Inspector*.
- Unlocked achievements (e.g. *First Case Closed*, *Sharp Eye*, *Mind Like a Razor*, *Speed Solver*, *Chronologist*).
- Global Hall of Fame leaderboard ranking detectives by legitimate score and solved cases.

---

## 2. Technology Stack

### Frontend
- **Structure:** Semantic HTML5 with accessibility attributes and unique component IDs.
- **Styling:** Vanilla CSS3 with a bespoke, cinematic noir dark-mode design system (HSL color tokens, subtle amber/gold accents, responsive flex/grid layouts, smooth animations).
- **Logic:** Vanilla ES6+ JavaScript (Fetch API, DOM manipulation, custom event buses).
- **Icons:** Inline SVG vector icon system based on Lucide design language.
- **Interactions:** Native HTML5 Drag and Drop API & Pointer/Mouse event coordinate engines for the corkboard.

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js with clean REST API architecture.
- **Authentication:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256.
- **Security:** `bcryptjs` password hashing (12 salt rounds), `express-rate-limit` DDoS prevention, `express-validator` request sanitization, and strict CORS configuration.
- **Logging:** Morgan HTTP request logger (development mode).

### Database
- **Engine:** MongoDB
- **ODM:** Mongoose with strictly typed schemas, custom validation, pre-save hooks, and virtual transforms.

---

## 3. Repository Structure

```
MindMaze/
├── backend/                  # Backend application source
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Express route controllers (auth, cases, investigations, etc.)
│   ├── middleware/           # Auth guard, request validators, error handlers
│   ├── models/               # Mongoose data schemas (User, Case, Investigation)
│   ├── routes/               # Modular Express API route definitions
│   ├── services/             # Scoring rules, deduction engine, and seed datasets
│   └── tests/                # Automated backend test suites
├── frontend/                 # Client application source
│   ├── assets/               # Static media, icons, and illustrations
│   ├── css/                  # Design system tokens and page stylesheets
│   │   ├── main.css          # Design system, CSS variables, utility classes, components
│   │   ├── landing.css       # Landing page presentation
│   │   ├── auth.css          # Sign in / registration styles
│   │   ├── cases.css         # Case library layout
│   │   ├── workspace.css     # Investigation studio & evidence board
│   │   ├── dashboard.css     # Detective profile & achievements
│   │   └── leaderboard.css   # Hall of Fame podium and table
│   ├── js/                   # Client-side modules
│   │   ├── api.js            # Centralized API HTTP client wrapper
│   │   ├── auth.js           # Session and authentication state manager
│   │   ├── ui.js             # Reusable UI helpers, toasts, modals, loaders
│   │   └── workspace.js      # Core gameplay controller and workspace logic
│   ├── pages/                # Application page views
│   │   ├── auth.html         # Login / Registration view
│   │   ├── cases.html        # Mystery Case Library view
│   │   ├── workspace.html    # Full Investigation Studio view
│   │   ├── dashboard.html    # Detective Dashboard view
│   │   └── leaderboard.html  # Hall of Fame Leaderboard view
│   └── index.html            # Public marketing landing page
├── docs/                     # Technical documentation
│   ├── api.md                # Comprehensive REST API endpoint contract
│   ├── architecture.md       # Architecture overview, schemas & state machines
│   └── git-workflow.md       # Branching strategy and git collaboration guide
├── tests/                    # System & integration test suites
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore specifications
├── package.json              # NPM dependencies and scripts
└── README.md                 # Project documentation and manual
```

---

## 4. Prerequisites

Before running the application, ensure you have the following installed:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **NPM**: v9.0.0 or higher (bundled with Node.js)
- **MongoDB**: Community Server v6.0+ or a cloud-hosted MongoDB Atlas URI ([Download MongoDB](https://www.mongodb.com/try/download/community))

---

## 5. Environment Configuration

1. Copy the sample environment file to create your local `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure your environment variables:
   ```ini
   # Server Port
   PORT=3000

   # Runtime Environment
   NODE_ENV=development

   # MongoDB Connection String
   MONGODB_URI=mongodb://localhost:27017/mindmaze

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRES_IN=7d

   # API Rate Limiting (per 15 minutes)
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

---

## 6. Installation & Database Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB:**
   - If running locally as a service: ensure your MongoDB service is running on port `27017`.
   - If running via Docker:
     ```bash
     docker run -d -p 27017:27017 --name mindmaze-mongo mongo:latest
     ```

3. **Seed Mystery Cases:**
   Populate the database with the two canonical playable mystery cases (*The Vanishing Violin* and *The Hemlock Club*):
   ```bash
   npm run seed
   ```

---

## 7. Starting the Application

### Development Mode (with auto-restart via nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Once running, navigate your browser to:
- **Web Application:** [http://localhost:3000](http://localhost:3000)
- **API Health Check:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 8. Playable Mystery Cases

MindMaze ships with two complete, intricately plotted mystery cases:

| Case ID | Title | Difficulty | Setting | Summary |
|---------|-------|------------|---------|---------|
| `case-001` | **The Vanishing Violin** | Medium | Victorian Manor, 1920s England | A priceless Stradivarius violin vanishes from Lord Ashworth's locked study during a dinner party. Sift through 4 suspects, 7 clues, and broken glass to uncover the thief. |
| `case-002` | **The Hemlock Club** | Hard | Manhattan Gentlemen's Club, 1947 | Financier Edmund Roth is found dead in his armchair. Poisoned by cyanide in his bourbon. Unravel dark secrets across 4 elite club members. |

---

## 9. API Documentation

Complete documentation for all endpoints, request bodies, query parameters, and response schemas is detailed in [`docs/api.md`](docs/api.md).

Quick summary of core endpoints:
- `POST /api/auth/register` — Register a detective account
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/cases` — Retrieve playable mystery cases (spoiler-free)
- `GET /api/cases/:caseId` — Case details, suspects, and clues
- `POST /api/investigations` — Open a case investigation
- `POST /api/investigations/:id/clues/:clueId` — Discover a clue at the crime scene
- `POST /api/investigations/:id/connections` — Link two clues on the evidence board
- `PUT /api/investigations/:id/timeline` — Submit and evaluate chronological timeline
- `POST /api/investigations/:id/hints/:hintId` — Request progressive hints
- `POST /api/investigations/:id/accusations` — Submit suspect accusation and finalize case
- `GET /api/leaderboard` — View public detective rankings

---

## 10. Automated Testing

MindMaze includes automated test suites covering scoring mechanics, input validation, timeline algorithms, authentication, anti-exploit rules, and user data isolation.

To run tests:
```bash
npm test
```

To run tests with code coverage analysis:
```bash
npm run test:coverage
```

Test coverage includes:
- ✅ User registration & authentication validation
- ✅ Unauthorized & cross-user access restrictions
- ✅ Case retrieval without leaking hidden solutions
- ✅ Clue discovery and prevention of duplicate XP awards
- ✅ Evidence board connection persistence and self-connection prevention
- ✅ Timeline event evaluation and partial score grading
- ✅ Progressive hint deduction penalties
- ✅ Server-side accusation evaluation, rank progression, and achievement unlocking

---

## 11. Git Collaboration & Feature Branches

The repository is structured to enable clean, independent Git branch workflows for frontend, backend, and integration tasks. Refer to [`docs/git-workflow.md`](docs/git-workflow.md) for full branch conventions.

### Quick Git Commands:
```bash
# Branch for frontend UI work
git checkout -b feature/frontend-workspace-enhancements
git commit -m "feat(frontend): refine corkboard yarn rendering"

# Branch for backend API work
git checkout -b feature/backend-custom-achievements
git commit -m "feat(backend): add achievement triggers for speed solvers"

# Merge into develop integration branch
git checkout develop
git merge --no-ff feature/frontend-workspace-enhancements
```

---

## 12. Deployment Instructions

### Production Deployment (e.g. Ubuntu / VPS / Docker / Cloud PaaS)
1. Set `NODE_ENV=production` in your deployment environment.
2. Provide a persistent `MONGODB_URI` connection string (e.g., MongoDB Atlas).
3. Generate a cryptographically secure `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Build / start with a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "mindmaze"
   ```
5. Use NGINX or Caddy as a reverse proxy for SSL termination (port 443 → port 3000).

---

## 13. Known Limitations & Roadmap
- **Browser Compatibility:** Native Drag and Drop API requires desktop or pointer-supported mobile browsers; touch devices fall back to click-to-place board interaction.
- **Audio Effects:** Atmospheric soundscapes and typewriter sound effects can be toggled on/off in future releases.
- **Custom Case Creator:** Community case editor planned for v2.0.

---

## 14. License

Distributed under the MIT License. See `LICENSE` for details.
