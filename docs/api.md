# MindMaze REST API Documentation

This document describes the complete REST API contract for the MindMaze detective investigation platform, including endpoints, request parameters, request bodies, response formats, and error handling.

---

## Overview

- **Base URL:** `http://localhost:3000/api`
- **Content-Type:** `application/json`
- **Authentication:** Bearer token via `Authorization: Bearer <JWT_TOKEN>` header for protected endpoints.
- **Rate Limiting:** Default 100 requests per 15-minute window per IP.

### Standard Success Response Format
```json
{
  "success": true,
  "message": "Optional descriptive message",
  "data": { ... }
}
```

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description message",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

---

## 1. Authentication Endpoints

### 1.1 Register New Detective
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "username": "sherlock_holmes",
  "email": "sherlock@bakerstreet.co.uk",
  "password": "Password123!"
}
```
- **Validation Rules:**
  - `username`: Required, 3–20 characters, alphanumeric and underscores only.
  - `email`: Required, valid email format.
  - `password`: Required, minimum 6 characters.
- **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "658f123456789abcdef01234",
    "username": "sherlock_holmes",
    "xp": 0,
    "rank": "Rookie Detective",
    "casesCompleted": 0,
    "totalScore": 0,
    "achievements": [],
    "createdAt": "2026-10-27T12:00:00.000Z"
  }
}
```

### 1.2 Detective Sign In
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "sherlock@bakerstreet.co.uk",
  "password": "Password123!"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "658f123456789abcdef01234",
    "username": "sherlock_holmes",
    "xp": 1250,
    "rank": "Junior Detective",
    "casesCompleted": 1,
    "totalScore": 920,
    "achievements": [...]
  }
}
```

### 1.3 Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Access:** Protected (Bearer Token)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "658f123456789abcdef01234",
    "username": "sherlock_holmes",
    "xp": 1250,
    "rank": "Junior Detective",
    "casesCompleted": 1,
    "totalScore": 920,
    "achievements": []
  }
}
```

### 1.4 Update User Profile
- **Method:** `PUT`
- **Path:** `/api/auth/me`
- **Access:** Protected (Bearer Token)
- **Request Body:**
```json
{
  "username": "great_detective"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "658f123456789abcdef01234",
    "username": "great_detective",
    "xp": 1250,
    "rank": "Junior Detective"
  }
}
```

---

## 2. Mystery Cases Endpoints

### 2.1 List All Active Cases
- **Method:** `GET`
- **Path:** `/api/cases`
- **Access:** Public
- **Query Parameters:**
  - `category` (string, optional): Filter by case category (`Theft`, `Murder`, etc.)
  - `difficulty` (string, optional): `Easy`, `Medium`, `Hard`, `Expert`
  - `search` (string, optional): Search keyword in title
- **Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "cases": [
    {
      "caseId": "case-001",
      "title": "The Vanishing Violin",
      "subtitle": "A Heist at Ashworth Manor",
      "description": "A priceless Stradivarius violin has vanished...",
      "difficulty": "Medium",
      "estimatedTime": "35-50 min",
      "category": "Theft",
      "setting": "Victorian manor house, 1920s England",
      "tags": ["theft", "manor", "1920s"]
    }
  ]
}
```
*Note: Solutions, secret culprit IDs, and guilty suspect flags are never exposed in public case responses.*

### 2.2 Get Specific Case Details
- **Method:** `GET`
- **Path:** `/api/cases/:caseId`
- **Access:** Public
- **Parameters:** `caseId` (e.g., `case-001`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "case": {
    "caseId": "case-001",
    "title": "The Vanishing Violin",
    "description": "...",
    "crimeSceneDescription": "The violin was kept in a locked glass display case...",
    "clues": [...],
    "timelineEvents": [...],
    "hints": [...]
  }
}
```

### 2.3 Get Case Suspects
- **Method:** `GET`
- **Path:** `/api/cases/:caseId/suspects`
- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "suspects": [
    {
      "id": "suspect-001-1",
      "name": "Eleanor Hargrove",
      "age": 34,
      "occupation": "Antique Appraiser",
      "background": "...",
      "motive": "...",
      "alibi": "...",
      "statements": [...]
    }
  ]
}
```

### 2.4 Get Case Discoverable Clues Metadata
- **Method:** `GET`
- **Path:** `/api/cases/:caseId/clues`
- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "clues": [
    {
      "id": "clue-001-1",
      "name": "Shattered Glass Fragments",
      "location": "Study floor near display case",
      "type": "physical",
      "imageHotspot": { "x": 35, "y": 55, "width": 8, "height": 8 }
    }
  ]
}
```

---

## 3. Investigation Endpoints

### 3.1 Start or Resume Investigation
- **Method:** `POST`
- **Path:** `/api/investigations`
- **Access:** Protected (Bearer Token)
- **Request Body:**
```json
{
  "caseId": "case-001"
}
```
- **Success Response (201 Created or 200 OK if resuming active):**
```json
{
  "success": true,
  "investigation": {
    "_id": "658f567890abcdef12345678",
    "userId": "658f123456789abcdef01234",
    "caseId": "case-001",
    "status": "active",
    "discoveredClues": [],
    "connections": [],
    "boardPositions": {},
    "notes": [],
    "hintsUsed": [],
    "startedAt": "2026-10-27T12:15:00.000Z"
  }
}
```

### 3.2 Get Investigation by ID
- **Method:** `GET`
- **Path:** `/api/investigations/:id`
- **Access:** Protected (Owner Only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "investigation": {
    "_id": "658f567890abcdef12345678",
    "status": "active",
    "discoveredClues": ["clue-001-1", "clue-001-2"],
    "connections": [...],
    "notes": [...]
  }
}
```

### 3.3 List User Investigations
- **Method:** `GET`
- **Path:** `/api/investigations`
- **Access:** Protected
- **Success Response (200 OK):**
```json
{
  "success": true,
  "investigations": [...]
}
```

### 3.4 Discover Clue in Crime Scene
- **Method:** `POST`
- **Path:** `/api/investigations/:id/clues/:clueId`
- **Access:** Protected (Owner Only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "alreadyDiscovered": false,
  "xpAwarded": 50,
  "clue": {
    "id": "clue-001-1",
    "name": "Shattered Glass Fragments",
    "description": "Tempered display glass shattered outwards...",
    "location": "East Wing Study",
    "type": "physical",
    "relatedSuspects": ["suspect-001-2"],
    "relatedClues": ["clue-001-3"]
  },
  "discoveredClues": ["clue-001-1"]
}
```
*Note: Duplicate discoveries return `alreadyDiscovered: true` and `xpAwarded: 0` to prevent duplicate reward exploitation.*

### 3.5 Submit Chronological Crime Timeline
- **Method:** `PUT`
- **Path:** `/api/investigations/:id/timeline`
- **Access:** Protected (Owner Only)
- **Request Body:**
```json
{
  "order": ["time-001-1", "time-001-2", "time-001-3", "time-001-4"]
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "isCorrect": true,
  "score": 100,
  "correctOrder": ["time-001-1", "time-001-2", "time-001-3", "time-001-4"],
  "feedback": "Perfect! Your timeline reconstruction is correct."
}
```

### 3.6 Evidence Board: Connect Clues
- **Method:** `POST`
- **Path:** `/api/investigations/:id/connections`
- **Access:** Protected (Owner Only)
- **Request Body:**
```json
{
  "clueIdA": "clue-001-1",
  "clueIdB": "clue-001-3",
  "label": "Matches entry timing"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "connections": [
    {
      "_id": "658f89012345abcdef678901",
      "clueIdA": "clue-001-1",
      "clueIdB": "clue-001-3",
      "label": "Matches entry timing",
      "createdAt": "2026-10-27T12:20:00.000Z"
    }
  ]
}
```

### 3.7 Evidence Board: Delete Connection
- **Method:** `DELETE`
- **Path:** `/api/investigations/:id/connections/:connectionId`
- **Access:** Protected (Owner Only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "connections": []
}
```

### 3.8 Evidence Board: Save Card Layout
- **Method:** `PUT`
- **Path:** `/api/investigations/:id/board`
- **Access:** Protected (Owner Only)
- **Request Body:**
```json
{
  "positions": {
    "clue-001-1": { "x": 120, "y": 80 },
    "clue-001-3": { "x": 360, "y": 140 }
  }
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "boardPositions": {
    "clue-001-1": { "x": 120, "y": 80 },
    "clue-001-3": { "x": 360, "y": 140 }
  }
}
```

### 3.9 Detective Notebook: Get Notes
- **Method:** `GET`
- **Path:** `/api/investigations/:id/notes`
- **Access:** Protected (Owner Only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "notes": [
    {
      "_id": "658fa1112223334445556667",
      "title": "Alibi inconsistency",
      "content": "Victor claims he was in the dining room, but Clara saw him in the corridor at 10:15 PM.",
      "color": "amber",
      "createdAt": "2026-10-27T12:22:00.000Z"
    }
  ]
}
```

### 3.10 Detective Notebook: Add Note
- **Method:** `POST`
- **Path:** `/api/investigations/:id/notes`
- **Access:** Protected (Owner Only)
- **Request Body:**
```json
{
  "title": "Alibi inconsistency",
  "content": "Victor claims he was in dining room...",
  "color": "amber"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "notes": [...]
}
```

### 3.11 Detective Notebook: Update Note
- **Method:** `PUT`
- **Path:** `/api/investigations/:id/notes/:noteId`
- **Access:** Protected (Owner Only)
- **Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "notes": [...]
}
```

### 3.12 Detective Notebook: Delete Note
- **Method:** `DELETE`
- **Path:** `/api/investigations/:id/notes/:noteId`
- **Access:** Protected (Owner Only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "notes": [...]
}
```

### 3.13 Request Progressive Hint
- **Method:** `POST`
- **Path:** `/api/investigations/:id/hints/:hintId`
- **Access:** Protected (Owner Only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "hint": {
    "id": "hint-001-1",
    "text": "Examine the direction of the glass shards. Were they blown in or out?",
    "order": 1,
    "xpPenalty": 25
  },
  "alreadyUsed": false
}
```

### 3.14 Submit Final Accusation
- **Method:** `POST`
- **Path:** `/api/investigations/:id/accusations`
- **Access:** Protected (Owner Only)
- **Request Body:**
```json
{
  "suspectId": "suspect-001-2",
  "reasoning": "Victor Ashworth needed cash to pay off gambling debts. His alibi collapses because the maid saw him near the passage with muddy shoes."
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "isCorrect": true,
  "score": 930,
  "xpEarned": 930,
  "breakdown": {
    "base": 600,
    "clueBonus": 120,
    "timelineBonus": 90,
    "hintPenalty": -30,
    "timeBonus": 150,
    "total": 930
  },
  "newAchievements": [
    {
      "id": "first_case",
      "name": "First Case Closed",
      "description": "Complete your first investigation.",
      "icon": "🔍"
    }
  ],
  "solution": {
    "culpritId": "suspect-001-2",
    "explanation": "Victor Ashworth stole the violin. Drowning in gambling debt...",
    "keyEvidence": ["clue-001-3", "clue-001-5", "clue-001-6"]
  },
  "userStats": {
    "xp": 1180,
    "rank": "Junior Detective",
    "casesCompleted": 1,
    "totalScore": 930
  }
}
```

---

## 4. Leaderboard & Dashboard Endpoints

### 4.1 Global Detective Leaderboard
- **Method:** `GET`
- **Path:** `/api/leaderboard`
- **Access:** Public
- **Query Parameters:**
  - `limit` (number, default: 20)
  - `page` (number, default: 1)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "total": 42,
  "page": 1,
  "leaderboard": [
    {
      "rank": 1,
      "username": "hercule_p",
      "xp": 5400,
      "detectiveRank": "Chief Inspector",
      "casesCompleted": 5,
      "totalScore": 4850
    }
  ]
}
```

### 4.2 Detective Dashboard Stats
- **Method:** `GET`
- **Path:** `/api/dashboard`
- **Access:** Protected (Bearer Token)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "user": { ... },
  "stats": {
    "casesActive": 1,
    "casesCompleted": 2,
    "avgScore": 875,
    "totalXP": 2400
  },
  "activeInvestigations": [...],
  "completedInvestigations": [...]
}
```

---

## 5. System Health Check
- **Method:** `GET`
- **Path:** `/api/health`
- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "MindMaze API is running.",
  "timestamp": "2026-10-27T12:00:00.000Z"
}
```
