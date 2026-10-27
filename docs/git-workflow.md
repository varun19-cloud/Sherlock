# MindMaze Git Collaboration & Branching Strategy

This guide outlines the Git branching strategy and collaborative workflow for developing MindMaze in a single repository across frontend, backend, and integration efforts.

---

## 1. Branching Model

```
main (Production Releases, v1.0.0, v1.1.0)
  │
  └── develop (Integration & Pre-release testing)
        ├── feature/frontend-evidence-board
        ├── feature/backend-scoring-rules
        ├── feature/case-003-cathedral-heist
        └── bugfix/timeline-drag-order
```

| Branch Type | Naming Convention | Base Branch | Target Merge |
|-------------|-------------------|-------------|--------------|
| Production | `main` | - | - |
| Integration | `develop` | `main` | `main` |
| Frontend Feature | `feature/frontend-<name>` | `develop` | `develop` |
| Backend Feature | `feature/backend-<name>` | `develop` | `develop` |
| Case Content | `feature/case-<name>` | `develop` | `develop` |
| Hotfix | `hotfix/<issue>` | `main` | `main` & `develop` |

---

## 2. Standard Workflow Commands

### 2.1 Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd MindMaze

# Initialize or switch to develop branch
git checkout -b develop
```

### 2.2 Working on a Frontend Feature
Frontend changes should focus on files under `frontend/` (pages, css, js, assets).
```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create a frontend feature branch
git checkout -b feature/frontend-evidence-board

# Make changes to frontend files
# ... edit frontend/js/workspace.js, frontend/css/workspace.css ...

# Check status and stage changes
git status
git add frontend/

# Commit with a clear, descriptive message
git commit -m "feat(frontend): enhance evidence board drag-and-drop connections"

# Push feature branch to remote
git push -u origin feature/frontend-evidence-board
```

### 2.3 Working on a Backend Feature
Backend changes should focus on `backend/` and `docs/api.md`.
```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create a backend feature branch
git checkout -b feature/backend-scoring-rules

# Make changes to backend files
# ... edit backend/services/scoringService.js, backend/tests/scoring.test.js ...

# Run automated tests before committing
npm test

# Stage and commit
git add backend/
git commit -m "feat(backend): add time-decay bonus calculation and test suite"

# Push feature branch
git push -u origin feature/backend-scoring-rules
```

### 2.4 Integrating into `develop`
```bash
# Switch to develop
git checkout develop
git pull origin develop

# Merge feature branch using --no-ff to retain feature history
git merge --no-ff feature/frontend-evidence-board -m "merge: incorporate evidence board enhancements"

# Run tests to verify integration integrity
npm test

# Push integration updates
git push origin develop
```

### 2.5 Preparing a Production Release to `main`
```bash
# Checkout main and merge develop
git checkout main
git pull origin main
git merge --no-ff develop -m "release: v1.0.0 production release"

# Create a version tag
git tag -a v1.0.0 -m "MindMaze v1.0.0 - Complete detective investigation platform"

# Push release and tags
git push origin main
git push origin --tags
```

---

## 3. Best Practices & Boundaries
- **No Direct Commits to `main`**: All features must pass tests on `develop` before merging to `main`.
- **Pre-commit Self Checks**:
  1. No secrets, credentials, or `.env` files staged (enforced by `.gitignore`).
  2. No hardcoded culprits exposed in frontend code.
  3. `npm test` passes completely without errors.
- **Atomic Commits**: Keep commits focused and logically grouped with standard conventional commit prefixes (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
