/**
 * MindMaze — Investigation Workspace Controller
 * Handles all gameplay logic: crime scene, suspects, evidence board,
 * timeline, notebook, hints, and final accusation.
 */

if (!auth.requireAuth()) { /* redirected */ }

// ── State ──────────────────────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const INV_ID  = params.get('inv');
const CASE_ID = params.get('caseId');

let investigation = null;
let caseData = null;
let suspects = [];
let allClues = [];

// Evidence board state
let selectedCards = [];
let dragCard = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let boardPositions = {};

// Accusation state
let selectedSuspectId = null;

// Timer
let timerInterval = null;
let startTime = null;

// ── Bootstrap ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!INV_ID || !CASE_ID) {
    toast.error('Invalid investigation URL.');
    setTimeout(() => window.location.href = '/pages/cases.html', 1500);
    return;
  }
  initWorkspace();
  setupTabNavigation();
  setupNavbar();
});

async function initWorkspace() {
  try {
    const [invData, caseResp, suspectsResp] = await Promise.all([
      api.getInvestigation(INV_ID),
      api.getCase(CASE_ID),
      api.getCaseSuspects(CASE_ID),
    ]);

    investigation = invData.investigation;
    caseData = caseResp.case;
    suspects = suspectsResp.suspects;
    allClues = caseData.clues || [];

    // Init UI
    document.getElementById('workspace-case-title').textContent = caseData.title;
    document.title = `${caseData.title} — MindMaze`;

    if (investigation.status === 'completed') {
      document.getElementById('workspace-status-badge').textContent = 'Completed';
      document.getElementById('workspace-status-badge').className = 'badge badge-success';
    }

    // Start timer
    startTime = new Date(investigation.startedAt);
    updateTimer();
    if (investigation.status === 'active') {
      timerInterval = setInterval(updateTimer, 1000);
    }

    // Populate board positions from saved data
    boardPositions = investigation.boardPositions || {};

    // Render panels
    renderCrimeScene();
    renderSuspects();
    renderEvidence();
    renderEvidenceBoard();
    renderTimeline();
    renderNotes();
    renderHints();
    renderAccusationPanel();

    // Update evidence count badge
    updateEvidenceBadge();

  } catch (err) {
    toast.error('Failed to load investigation: ' + err.message);
  }
}

function updateTimer() {
  const now = Date.now();
  const elapsed = Math.floor((now - startTime.getTime()) / 1000);
  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  document.getElementById('workspace-timer').textContent = `${m}:${s}`;
}

// ── Tab Navigation ─────────────────────────────────────────────────────────
function setupTabNavigation() {
  document.querySelectorAll('.workspace-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.workspace-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.ws-panel').forEach(p => p.classList.add('hidden'));
  const panel = document.getElementById(`panel-${tab}`);
  if (panel) {
    panel.classList.remove('hidden');
    // Re-render board connections when switching to board
    if (tab === 'board') renderBoardConnections();
  }
}

function setupNavbar() {
  // Nothing extra needed; auth.js handles user
}

function updateEvidenceBadge() {
  const count = investigation ? investigation.discoveredClues.length : 0;
  document.getElementById('evidence-count').textContent = count;
}

// ── CRIME SCENE ────────────────────────────────────────────────────────────
function renderCrimeScene() {
  document.getElementById('scene-description').textContent = caseData.crimeSceneDescription || '';
  document.getElementById('scene-subtitle').textContent = caseData.setting || '';

  // Render atmospheric SVG scene art
  const art = document.getElementById('scene-art');
  art.className = `scene-placeholder-art scene-${caseData.caseId}`;
  art.innerHTML = generateSceneArt(caseData.caseId);

  // Render hotspots
  renderSceneHotspots();
  updateSceneDiscoveredList();
}

function generateSceneArt(caseId) {
  if (caseId === 'case-001') {
    return `
      <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
        <defs>
          <radialGradient id="roomlight" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#3a2a12" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#050810" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="floorgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1a1208"/>
            <stop offset="100%" stop-color="#0a0a0a"/>
          </linearGradient>
        </defs>
        <!-- Room background -->
        <rect width="800" height="500" fill="#0e1520"/>
        <!-- Walls -->
        <rect x="0" y="0" width="800" height="320" fill="#141820"/>
        <!-- Floor -->
        <rect x="0" y="320" width="800" height="180" fill="url(#floorgrad)"/>
        <!-- Wainscoting -->
        <rect x="0" y="280" width="800" height="12" fill="#1e1a0e" opacity="0.7"/>
        <!-- Window -->
        <rect x="560" y="40" width="180" height="220" rx="4" fill="#162040" stroke="#2a3050" stroke-width="2"/>
        <line x1="650" y1="40" x2="650" y2="260" stroke="#2a3050" stroke-width="2"/>
        <line x1="560" y1="140" x2="740" y2="140" stroke="#2a3050" stroke-width="2"/>
        <rect x="560" y="40" width="180" height="220" rx="4" fill="#203060" opacity="0.15"/>
        <!-- Moonlight shaft -->
        <polygon points="560,40 740,40 800,400 500,400" fill="#162040" opacity="0.08"/>
        <!-- Bookshelf left -->
        <rect x="0" y="30" width="140" height="260" fill="#1a1208"/>
        <rect x="10" y="40" width="120" height="240" fill="#141008"/>
        <g fill="#2a1e0e" stroke="#1a1208" stroke-width="1">
          <rect x="15" y="50" width="12" height="80"/>
          <rect x="29" y="55" width="10" height="75"/>
          <rect x="41" y="45" width="14" height="85"/>
          <rect x="57" y="52" width="11" height="78"/>
          <rect x="70" y="48" width="13" height="82"/>
          <rect x="85" y="50" width="10" height="80"/>
          <rect x="97" y="44" width="15" height="86"/>
          <rect x="114" y="53" width="11" height="77"/>
          <!-- Second shelf -->
          <rect x="15" y="145" width="12" height="70"/>
          <rect x="29" y="150" width="10" height="65"/>
          <rect x="41" y="143" width="14" height="72"/>
          <rect x="57" y="148" width="11" height="67"/>
          <rect x="70" y="145" width="13" height="70"/>
        </g>
        <!-- Display case (broken) -->
        <rect x="250" y="200" width="200" height="140" rx="4" fill="#1a1510" stroke="#3a2a10" stroke-width="2"/>
        <rect x="258" y="208" width="184" height="124" rx="2" fill="#0e1a1a" opacity="0.6"/>
        <!-- Broken glass shards -->
        <polygon points="280,280 310,260 295,295" fill="#aacccc" opacity="0.3"/>
        <polygon points="330,270 355,285 340,300" fill="#aacccc" opacity="0.25"/>
        <polygon points="360,260 380,275 365,290" fill="#aacccc" opacity="0.2"/>
        <!-- Stand where violin was -->
        <rect x="320" y="235" width="60" height="5" rx="2" fill="#2a1e0e"/>
        <rect x="345" y="240" width="10" height="50" fill="#2a1e0e"/>
        <!-- Desk -->
        <rect x="60" y="270" width="220" height="60" rx="4" fill="#1a1208"/>
        <!-- Papers on desk -->
        <rect x="80" y="255" width="80" height="60" rx="2" fill="#e8e0d0" opacity="0.1" transform="rotate(-5 120 285)"/>
        <rect x="100" y="250" width="80" height="60" rx="2" fill="#e8e0d0" opacity="0.08" transform="rotate(3 140 280)"/>
        <!-- Candelabra -->
        <rect x="270" y="240" width="4" height="30" fill="#8a6228"/>
        <circle cx="272" cy="238" r="5" fill="#8a6228"/>
        <ellipse cx="272" cy="236" rx="3" ry="5" fill="#ffcc44" opacity="0.6"/>
        <!-- Floor footprints -->
        <ellipse cx="480" cy="380" rx="12" ry="7" fill="#3a2010" opacity="0.6" transform="rotate(-20 480 380)"/>
        <ellipse cx="510" cy="360" rx="12" ry="7" fill="#3a2010" opacity="0.55" transform="rotate(-15 510 360)"/>
        <ellipse cx="545" cy="345" rx="12" ry="7" fill="#3a2010" opacity="0.5" transform="rotate(-10 545 345)"/>
        <!-- Velvet scrap near window -->
        <path d="M580,290 Q590,285 600,290 Q595,300 585,295 Z" fill="#1a0a1a" opacity="0.8"/>
        <!-- Ambient light glow -->
        <circle cx="400" cy="100" r="200" fill="url(#roomlight)"/>
        <!-- Fireplace glow -->
        <rect x="680" y="180" width="100" height="150" fill="#1a0a00" opacity="0.8"/>
        <ellipse cx="730" cy="330" rx="50" ry="10" fill="#c9500a" opacity="0.3"/>
        <ellipse cx="730" cy="280" rx="20" ry="30" fill="#c96a10" opacity="0.2"/>
      </svg>`;
  }

  // Case 002 — Gentlemen's Club
  return `
    <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <defs>
        <radialGradient id="lamplight" cx="40%" cy="20%" r="50%">
          <stop offset="0%" stop-color="#3a2a00" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#050508" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Room -->
      <rect width="800" height="500" fill="#0a0c12"/>
      <!-- Walls -->
      <rect x="0" y="0" width="800" height="300" fill="#12100c"/>
      <!-- Wood paneling -->
      <rect x="0" y="260" width="800" height="10" fill="#1e160a" opacity="0.9"/>
      <!-- Floor -->
      <rect x="0" y="310" width="800" height="190" fill="#0e0c08"/>
      <!-- Floor tiles -->
      <g fill="none" stroke="#1a1610" stroke-width="1" opacity="0.5">
        <line x1="0" y1="360" x2="800" y2="360"/>
        <line x1="0" y1="410" x2="800" y2="410"/>
        <line x1="0" y1="460" x2="800" y2="460"/>
        <line x1="100" y1="310" x2="100" y2="500"/>
        <line x1="200" y1="310" x2="200" y2="500"/>
        <line x1="300" y1="310" x2="300" y2="500"/>
        <line x1="400" y1="310" x2="400" y2="500"/>
        <line x1="500" y1="310" x2="500" y2="500"/>
        <line x1="600" y1="310" x2="600" y2="500"/>
        <line x1="700" y1="310" x2="700" y2="500"/>
      </g>
      <!-- Fireplace -->
      <rect x="320" y="60" width="160" height="200" rx="4" fill="#0e0c0a"/>
      <rect x="330" y="70" width="140" height="170" rx="2" fill="#100e0c"/>
      <ellipse cx="400" cy="240" rx="70" ry="15" fill="#c94a00" opacity="0.4"/>
      <ellipse cx="400" cy="220" rx="40" ry="25" fill="#d96000" opacity="0.25"/>
      <ellipse cx="400" cy="200" rx="25" ry="35" fill="#e07000" opacity="0.15"/>
      <!-- Mantle -->
      <rect x="300" y="55" width="200" height="15" rx="2" fill="#1e1610"/>
      <!-- Leather chair (victim's) -->
      <rect x="130" y="250" width="130" height="100" rx="8" fill="#180e08"/>
      <rect x="130" y="220" width="130" height="45" rx="8" fill="#200e08"/>
      <rect x="130" y="250" width="20" height="100" rx="4" fill="#1c1008"/>
      <rect x="240" y="250" width="20" height="100" rx="4" fill="#1c1008"/>
      <!-- Victim slumped -->
      <ellipse cx="195" cy="330" rx="40" ry="15" fill="#1a0a0a" opacity="0.7"/>
      <!-- Bourbon glass on side table -->
      <rect x="265" y="275" width="30" height="5" rx="2" fill="#1e160a"/>
      <rect x="268" y="245" width="24" height="32" rx="2" fill="#162030" opacity="0.8"/>
      <ellipse cx="280" cy="245" rx="12" ry="4" fill="#203040" opacity="0.6"/>
      <!-- Bar in background -->
      <rect x="600" y="60" width="200" height="260" fill="#140e08"/>
      <rect x="600" y="60" width="200" height="8" fill="#1e1608"/>
      <!-- Bottles on bar -->
      <g fill="#1e2030" stroke="#2a3040" stroke-width="1">
        <rect x="615" y="30" width="12" height="32" rx="2"/>
        <rect x="632" y="25" width="12" height="37" rx="2"/>
        <rect x="649" y="28" width="10" height="34" rx="2"/>
        <rect x="664" y="22" width="14" height="40" rx="2"/>
        <rect x="684" y="27" width="11" height="35" rx="2"/>
        <rect x="700" y="24" width="13" height="38" rx="2"/>
      </g>
      <!-- Bar ledger (clue) -->
      <rect x="630" y="68" width="50" height="35" rx="2" fill="#e8e0d0" opacity="0.12" transform="rotate(5 655 85)"/>
      <!-- Reading chairs -->
      <rect x="520" y="260" width="100" height="80" rx="6" fill="#180e08"/>
      <rect x="520" y="235" width="100" height="38" rx="6" fill="#200e08"/>
      <!-- Ambient light -->
      <circle cx="300" cy="80" r="250" fill="url(#lamplight)"/>
      <!-- Gas lamp -->
      <rect x="75" y="40" width="6" height="200" fill="#1e1608"/>
      <ellipse cx="78" cy="40" rx="20" ry="8" fill="#2a2010"/>
      <ellipse cx="78" cy="30" rx="12" ry="20" fill="#ffcc44" opacity="0.15"/>
      <circle cx="78" cy="60" r="40" fill="#ffcc44" opacity="0.06"/>
      <!-- Empty vial clue (behind bar shelf) -->
      <rect x="720" y="60" width="6" height="14" rx="2" fill="#88cccc" opacity="0.4"/>
    </svg>`;
}

function renderSceneHotspots() {
  const container = document.getElementById('scene-hotspots');
  container.innerHTML = '';

  allClues.forEach(clue => {
    if (!clue.imageHotspot) return;
    const { x, y } = clue.imageHotspot;
    const discovered = investigation.discoveredClues.includes(clue.id);

    const hotspot = document.createElement('div');
    hotspot.className = `scene-hotspot ${discovered ? 'discovered' : ''}`;
    hotspot.style.left = `${x}%`;
    hotspot.style.top  = `${y}%`;
    hotspot.dataset.clueId = clue.id;
    hotspot.title = discovered ? `✓ ${clue.name}` : 'Investigate this area';

    hotspot.innerHTML = `
      <div class="scene-hotspot-tooltip">${discovered ? '✓ ' + clue.name : 'Click to investigate'}</div>
    `;

    if (!discovered) {
      hotspot.addEventListener('click', () => discoverClue(clue.id));
    } else {
      hotspot.addEventListener('click', () => {
        // Show clue details for already discovered clue
        const fullClue = allClues.find(c => c.id === clue.id) || clue;
        showClueModal(fullClue, false, 0);
      });
    }

    container.appendChild(hotspot);
  });
}

function updateSceneDiscoveredList() {
  const list = document.getElementById('scene-discovered-list');
  const discovered = investigation.discoveredClues;

  if (!discovered.length) {
    list.innerHTML = '<p class="text-muted text-sm">No clues discovered yet.</p>';
    return;
  }

  list.innerHTML = discovered.map(clueId => {
    const clue = allClues.find(c => c.id === clueId);
    if (!clue) return '';
    return `
      <div class="clue-mini-item">
        <span>${clueTypeIcon(clue.type)}</span>
        <span>${clue.name || clueId}</span>
      </div>
    `;
  }).join('');
}

async function discoverClue(clueId) {
  try {
    const data = await api.discoverClue(INV_ID, clueId);
    investigation.discoveredClues = data.discoveredClues;

    if (!data.alreadyDiscovered) {
      // Add to investigation clueXpAwarded locally
      showClueModal(data.clue, true, data.xpAwarded);
      toast.success(`Clue discovered: ${data.clue.name}`);
    } else {
      showClueModal(data.clue, false, 0);
    }

    // Re-render hotspots with updated state
    renderSceneHotspots();
    updateSceneDiscoveredList();
    updateEvidenceBadge();
    renderEvidence();
    renderEvidenceBoard();
  } catch (err) {
    toast.error(err.message || 'Failed to discover clue.');
  }
}

function showClueModal(clue, isNew, xpAwarded) {
  const modal = document.getElementById('clue-modal');
  document.getElementById('clue-modal-title').textContent = isNew ? '🔍 Clue Discovered!' : clue.name;
  document.getElementById('clue-modal-type-badge').innerHTML = `<span class="badge badge-amber">${clueTypeIcon(clue.type)} ${clue.type}</span>`;
  document.getElementById('clue-modal-description').textContent = clue.description || '';
  document.getElementById('clue-modal-location').textContent = clue.location || '';
  document.getElementById('clue-modal-xp').innerHTML = isNew && xpAwarded
    ? `+${xpAwarded} XP awarded`
    : (isNew ? 'Evidence added to your collection.' : 'Already in your collection.');

  modal.classList.remove('hidden');
}

document.getElementById('close-clue-modal').addEventListener('click', () => {
  document.getElementById('clue-modal').classList.add('hidden');
});
document.getElementById('close-clue-modal-2').addEventListener('click', () => {
  document.getElementById('clue-modal').classList.add('hidden');
});
document.getElementById('clue-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('clue-modal')) {
    document.getElementById('clue-modal').classList.add('hidden');
  }
});

// ── SUSPECTS ───────────────────────────────────────────────────────────────
function renderSuspects() {
  const grid = document.getElementById('suspects-grid');
  if (!suspects.length) {
    grid.innerHTML = '<p class="text-muted">No suspects loaded.</p>';
    return;
  }

  const suspectEmojis = { 0: '🧑‍💼', 1: '👨‍⚕️', 2: '👩‍💼', 3: '🧔' };
  grid.innerHTML = suspects.map((s, i) => `
    <div class="suspect-card">
      <div class="suspect-portrait">
        <span>${suspectEmojis[i] || '🕵️'}</span>
      </div>
      <div class="suspect-info">
        <div class="suspect-name">${s.name}</div>
        <div class="suspect-occupation">${s.occupation || ''}</div>
        <div class="suspect-detail">
          <div class="suspect-detail-label">Background</div>
          ${s.background || 'Unknown'}
        </div>
        <div class="suspect-detail">
          <div class="suspect-detail-label">Motive</div>
          ${s.motive || 'Under investigation'}
        </div>
        <div class="suspect-detail">
          <div class="suspect-detail-label">Alibi</div>
          ${s.alibi || 'None provided'}
        </div>
        ${s.statements && s.statements.length ? `
          <details class="suspect-statements">
            <summary>Statements (${s.statements.length})</summary>
            ${s.statements.map(st => `<div class="statement-item">"${st}"</div>`).join('')}
          </details>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// ── EVIDENCE ───────────────────────────────────────────────────────────────
function renderEvidence() {
  const grid = document.getElementById('evidence-grid');
  const discovered = investigation.discoveredClues;

  if (!discovered.length) {
    grid.innerHTML = `<div class="text-center text-muted" style="padding:var(--space-12)"><p>🔍 No evidence collected yet. Explore the crime scene.</p></div>`;
    document.getElementById('evidence-summary').textContent = 'No evidence yet.';
    return;
  }

  const discoveredClues = allClues.filter(c => discovered.includes(c.id));
  document.getElementById('evidence-summary').textContent = `${discoveredClues.length} of ${allClues.length} clues collected.`;

  grid.innerHTML = discoveredClues.map(c => `
    <div class="evidence-card">
      <div class="evidence-type-icon">${clueTypeIcon(c.type)}</div>
      <div class="evidence-name">${c.name}</div>
      <div class="evidence-desc">${c.description || ''}</div>
      <div class="evidence-location">📍 ${c.location || ''}</div>
      ${c.relatedSuspects && c.relatedSuspects.length ? `
        <div class="evidence-location" style="margin-top:4px">
          👤 Related: ${c.relatedSuspects.map(sid => {
            const s = suspects.find(x => x.id === sid);
            return s ? s.name : sid;
          }).join(', ')}
        </div>` : ''}
    </div>
  `).join('');
}

// ── EVIDENCE BOARD ─────────────────────────────────────────────────────────
function renderEvidenceBoard() {
  const board = document.getElementById('evidence-board');
  const discovered = investigation.discoveredClues;

  if (!discovered.length) {
    board.innerHTML = `<div class="text-center text-muted" style="padding:80px 20px"><p>No evidence to display. Collect clues first.</p></div>`;
    return;
  }

  board.innerHTML = '';

  const discoveredClues = allClues.filter(c => discovered.includes(c.id));
  const defaultPositions = generateDefaultPositions(discoveredClues.length);

  discoveredClues.forEach((clue, i) => {
    const pos = boardPositions[clue.id] || defaultPositions[i] || { x: 20 + (i * 200) % 800, y: 60 + Math.floor(i / 4) * 180 };

    const card = document.createElement('div');
    card.className = 'board-clue-card';
    card.dataset.clueId = clue.id;
    card.style.left = `${pos.x}px`;
    card.style.top  = `${pos.y}px`;
    card.innerHTML = `
      <div class="board-card-icon">${clueTypeIcon(clue.type)}</div>
      <div class="board-card-name">${clue.name}</div>
    `;

    // Drag
    card.addEventListener('mousedown', startDrag);

    // Click to select for connection
    card.addEventListener('click', (e) => {
      if (Math.abs(e.clientX - dragCard?._startX) < 5 && Math.abs(e.clientY - dragCard?._startY) < 5) {
        selectForConnection(clue.id, card);
      }
    });

    board.appendChild(card);
  });

  renderBoardConnections();
}

function generateDefaultPositions(count) {
  const positions = [];
  const cols = Math.ceil(Math.sqrt(count));
  for (let i = 0; i < count; i++) {
    positions.push({
      x: 40 + (i % cols) * 220,
      y: 40 + Math.floor(i / cols) * 200,
    });
  }
  return positions;
}

// Drag logic
function startDrag(e) {
  if (e.button !== 0) return;
  const card = e.currentTarget;
  dragCard = card;
  dragCard._startX = e.clientX;
  dragCard._startY = e.clientY;

  const rect = card.getBoundingClientRect();
  const boardRect = document.getElementById('evidence-board').getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  card.style.zIndex = 100;
  card.style.transition = 'none';

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  e.preventDefault();
}

function onDrag(e) {
  if (!dragCard) return;
  const boardRect = document.getElementById('evidence-board').getBoundingClientRect();
  let x = e.clientX - boardRect.left - dragOffsetX;
  let y = e.clientY - boardRect.top - dragOffsetY;
  x = Math.max(0, Math.min(x, boardRect.width - 180));
  y = Math.max(0, Math.min(y, boardRect.height - 100));
  dragCard.style.left = `${x}px`;
  dragCard.style.top  = `${y}px`;
}

function stopDrag(e) {
  if (!dragCard) return;
  const clueId = dragCard.dataset.clueId;
  const x = parseInt(dragCard.style.left);
  const y = parseInt(dragCard.style.top);

  boardPositions[clueId] = { x, y };
  dragCard.style.transition = '';
  dragCard.style.zIndex = '';

  // Save to server (debounced)
  saveBoardPositions();
  renderBoardConnections();

  dragCard = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

let savePositionsTimeout = null;
function saveBoardPositions() {
  clearTimeout(savePositionsTimeout);
  savePositionsTimeout = setTimeout(async () => {
    try {
      await api.updateBoardPositions(INV_ID, boardPositions);
    } catch (e) { /* silent */ }
  }, 1000);
}

// Connection selection
function selectForConnection(clueId, card) {
  if (selectedCards.includes(clueId)) {
    // Deselect
    selectedCards = selectedCards.filter(id => id !== clueId);
    card.classList.remove('selected');
    return;
  }

  selectedCards.push(clueId);
  card.classList.add('selected');

  if (selectedCards.length === 2) {
    createConnection(selectedCards[0], selectedCards[1]);
  }
}

async function createConnection(idA, idB) {
  try {
    const data = await api.addConnection(INV_ID, { clueIdA: idA, clueIdB: idB });
    investigation.connections = data.connections;
    toast.success('Connection created.');
  } catch (err) {
    if (err.status !== 409) toast.error(err.message || 'Failed to create connection.');
  } finally {
    // Clear selection
    selectedCards = [];
    document.querySelectorAll('.board-clue-card.selected').forEach(c => c.classList.remove('selected'));
    renderBoardConnections();
  }
}

document.getElementById('clear-selection-btn').addEventListener('click', () => {
  selectedCards = [];
  document.querySelectorAll('.board-clue-card.selected').forEach(c => c.classList.remove('selected'));
});

function renderBoardConnections() {
  const svg = document.getElementById('board-connections');
  const board = document.getElementById('evidence-board');
  svg.innerHTML = '';

  if (!investigation || !investigation.connections) return;

  const boardRect = board.getBoundingClientRect();

  investigation.connections.forEach(conn => {
    const cardA = board.querySelector(`[data-clue-id="${conn.clueIdA}"]`);
    const cardB = board.querySelector(`[data-clue-id="${conn.clueIdB}"]`);
    if (!cardA || !cardB) return;

    const ax = parseInt(cardA.style.left) + 90;
    const ay = parseInt(cardA.style.top) + 50;
    const bx = parseInt(cardB.style.left) + 90;
    const by = parseInt(cardB.style.top) + 50;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', ax);
    line.setAttribute('y1', ay);
    line.setAttribute('x2', bx);
    line.setAttribute('y2', by);
    line.setAttribute('class', 'connection-line');
    line.setAttribute('data-conn-id', conn._id);

    // Double-click to remove
    line.style.pointerEvents = 'stroke';
    line.style.cursor = 'pointer';
    line.addEventListener('click', async () => {
      try {
        const data = await api.removeConnection(INV_ID, conn._id);
        investigation.connections = data.connections;
        renderBoardConnections();
        toast.info('Connection removed.');
      } catch (e) { toast.error('Failed to remove connection.'); }
    });

    svg.appendChild(line);
  });
}

// ── TIMELINE ───────────────────────────────────────────────────────────────
let timelineOrder = [];

function renderTimeline() {
  const container = document.getElementById('timeline-events');
  const events = caseData.timelineEvents || [];

  // Use submitted or shuffle
  if (investigation.timelineSubmission && investigation.timelineSubmission.order.length) {
    timelineOrder = [...investigation.timelineSubmission.order];
  } else {
    timelineOrder = shuffleArray(events.map(e => e.id));
  }

  renderTimelineList();

  // Show previous result if any
  if (investigation.timelineSubmission && investigation.timelineSubmission.submittedAt) {
    showTimelineResult(investigation.timelineSubmission.isCorrect, investigation.timelineSubmission.score);
  }
}

function renderTimelineList() {
  const container = document.getElementById('timeline-events');
  const events = caseData.timelineEvents || [];

  container.innerHTML = timelineOrder.map((eventId, i) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return '';
    return `
      <div class="timeline-event" draggable="true" data-event-id="${eventId}">
        <div class="timeline-event-handle">⠿</div>
        <div class="timeline-event-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="timeline-event-content">
          <div class="timeline-event-desc">${ev.description}</div>
          <div class="timeline-event-time">${ev.time}</div>
        </div>
      </div>
    `;
  }).join('');

  setupTimelineDrag();
}

function setupTimelineDrag() {
  const events = document.querySelectorAll('.timeline-event');
  let draggingEl = null;

  events.forEach(el => {
    el.addEventListener('dragstart', () => { draggingEl = el; el.classList.add('dragging'); });
    el.addEventListener('dragend', () => { el.classList.remove('dragging'); draggingEl = null; });
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggingEl && draggingEl !== el) {
        el.classList.add('drag-over');
        const container = document.getElementById('timeline-events');
        const allEvents = [...container.querySelectorAll('.timeline-event')];
        const idx = allEvents.indexOf(el);
        const dragIdx = allEvents.indexOf(draggingEl);
        if (dragIdx < idx) {
          el.parentNode.insertBefore(draggingEl, el.nextSibling);
        } else {
          el.parentNode.insertBefore(draggingEl, el);
        }
      }
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('drag-over');
      // Update order array
      const allEls = [...document.getElementById('timeline-events').querySelectorAll('.timeline-event')];
      timelineOrder = allEls.map(e => e.dataset.eventId);
      // Update numbers
      allEls.forEach((el, i) => {
        el.querySelector('.timeline-event-num').textContent = String(i+1).padStart(2,'0');
      });
    });
  });
}

document.getElementById('submit-timeline-btn').addEventListener('click', async () => {
  const btn = document.getElementById('submit-timeline-btn');
  setLoading(btn, true);
  try {
    const data = await api.submitTimeline(INV_ID, timelineOrder);
    investigation.timelineSubmission = { order: timelineOrder, isCorrect: data.isCorrect, score: data.score, submittedAt: new Date() };
    showTimelineResult(data.isCorrect, data.score);
    toast[data.isCorrect ? 'success' : 'warning'](data.feedback);
  } catch (err) {
    toast.error(err.message || 'Failed to submit timeline.');
  } finally {
    setLoading(btn, false);
  }
});

function showTimelineResult(isCorrect, score) {
  const el = document.getElementById('timeline-result');
  el.className = `alert ${isCorrect ? 'alert-success' : 'alert-warning'}`;
  el.textContent = isCorrect
    ? `✓ Perfect! Timeline is correct. Score: ${score}%`
    : `Timeline score: ${score}%. Review your evidence and try again.`;
  el.classList.remove('hidden');
}

// ── NOTEBOOK ───────────────────────────────────────────────────────────────
async function renderNotes() {
  try {
    const data = await api.getNotes(INV_ID);
    investigation.notes = data.notes;
    renderNoteCards();
  } catch (e) { /* use existing notes */ renderNoteCards(); }
}

function renderNoteCards() {
  const grid = document.getElementById('notes-grid');
  const notes = investigation.notes || [];

  if (!notes.length) {
    grid.innerHTML = `<div class="text-center text-muted" style="padding:var(--space-12)">
      <p>📓 No notes yet. Click "New Note" to begin.</p>
    </div>`;
    return;
  }

  grid.innerHTML = notes.map(note => `
    <div class="note-card" data-note-id="${note._id}">
      <div class="note-header">
        <div class="note-title">${escapeHtml(note.title)}</div>
        <div class="note-actions">
          <button class="btn btn-icon btn-ghost btn-sm note-edit-btn" data-note-id="${note._id}" title="Edit">✏️</button>
          <button class="btn btn-icon btn-danger btn-sm note-delete-btn" data-note-id="${note._id}" title="Delete">🗑</button>
        </div>
      </div>
      <div class="note-content">${escapeHtml(note.content)}</div>
      <div class="note-date">${timeAgo(note.updatedAt || note.createdAt)}</div>
    </div>
  `).join('');

  // Edit/delete handlers
  document.querySelectorAll('.note-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openNoteModal(btn.dataset.noteId));
  });
  document.querySelectorAll('.note-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteNote(btn.dataset.noteId));
  });
}

document.getElementById('add-note-btn').addEventListener('click', () => openNoteModal(null));

function openNoteModal(noteId) {
  const note = noteId ? (investigation.notes || []).find(n => n._id === noteId) : null;

  const overlay = openModal(`
    <div class="modal-header">
      <h3>${note ? 'Edit Note' : 'New Note'}</h3>
      <button class="btn btn-icon btn-ghost" onclick="closeModal()">✕</button>
    </div>
    <form id="note-form">
      <div class="form-group">
        <label class="form-label">Title</label>
        <input type="text" id="note-title" class="form-input" value="${note ? escapeHtml(note.title) : ''}" maxlength="100" placeholder="Note title" required/>
      </div>
      <div class="form-group mt-4">
        <label class="form-label">Content</label>
        <textarea id="note-content" class="form-input" rows="6" maxlength="2000" placeholder="Your observations…">${note ? escapeHtml(note.content) : ''}</textarea>
      </div>
      <div class="flex gap-3 mt-6">
        <button type="submit" class="btn btn-primary" id="note-save-btn">${note ? 'Save Changes' : 'Add Note'}</button>
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `);

  document.getElementById('note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('note-save-btn');
    setLoading(btn, true);
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();

    try {
      if (note) {
        const data = await api.updateNote(INV_ID, noteId, { title, content });
        investigation.notes = data.notes;
      } else {
        const data = await api.addNote(INV_ID, { title, content });
        investigation.notes = data.notes;
      }
      closeModal(overlay);
      renderNoteCards();
      toast.success(note ? 'Note updated.' : 'Note added.');
    } catch (err) {
      toast.error(err.message || 'Failed to save note.');
    } finally {
      setLoading(btn, false);
    }
  });
}

async function deleteNote(noteId) {
  if (!confirm('Delete this note?')) return;
  try {
    const data = await api.deleteNote(INV_ID, noteId);
    investigation.notes = data.notes;
    renderNoteCards();
    toast.success('Note deleted.');
  } catch (err) {
    toast.error('Failed to delete note.');
  }
}

// ── HINTS ──────────────────────────────────────────────────────────────────
function renderHints() {
  const container = document.getElementById('hints-container');
  const hints = caseData.hints || [];

  container.innerHTML = hints.map((hint, i) => {
    const used = investigation.hintsUsed.includes(hint.id);
    return `
      <div class="hint-card">
        <div class="hint-header">
          <span class="hint-label">Hint ${i + 1}</span>
          <div class="flex items-center gap-3">
            <span class="hint-penalty">-${hint.xpPenalty} XP</span>
            ${used
              ? `<span class="badge badge-muted">Revealed</span>`
              : `<button class="btn btn-outline btn-sm" data-hint-id="${hint.id}" data-hint-idx="${i}">Reveal Hint</button>`
            }
          </div>
        </div>
        <div class="hint-body ${used ? 'revealed' : ''}" id="hint-body-${hint.id}">
          <div class="hint-text">${hint.text}</div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-hint-id]').forEach(btn => {
    btn.addEventListener('click', () => revealHint(btn.dataset.hintId, btn));
  });
}

async function revealHint(hintId, btn) {
  if (!confirm('Revealing this hint will reduce your final score. Continue?')) return;
  try {
    const data = await api.useHint(INV_ID, hintId);
    if (!data.alreadyUsed) {
      investigation.hintsUsed.push(hintId);
      toast.warning(`Hint revealed. -${data.hint.xpPenalty} XP`);
    }
    document.getElementById(`hint-body-${hintId}`).classList.add('revealed');
    if (btn) btn.replaceWith(Object.assign(document.createElement('span'), { className: 'badge badge-muted', textContent: 'Revealed' }));
  } catch (err) {
    toast.error(err.message || 'Failed to reveal hint.');
  }
}

// ── ACCUSATION ─────────────────────────────────────────────────────────────
function renderAccusationPanel() {
  const suspectEmojis = ['🧑‍💼', '👨‍⚕️', '👩‍💼', '🧔', '👩', '🧓'];
  const container = document.getElementById('accusation-suspects');

  if (investigation.status === 'completed' && investigation.accusation?.revealed) {
    showAccusationResult();
    return;
  }

  container.innerHTML = suspects.map((s, i) => `
    <button class="accusation-suspect-btn" data-suspect-id="${s.id}">
      <div class="accusation-suspect-emoji">${suspectEmojis[i] || '🕵️'}</div>
      <div class="accusation-suspect-name">${s.name}</div>
      <div class="accusation-suspect-occ">${s.occupation || ''}</div>
    </button>
  `).join('');

  container.querySelectorAll('.accusation-suspect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.accusation-suspect-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSuspectId = btn.dataset.suspectId;
    });
  });
}

document.getElementById('submit-accusation-btn').addEventListener('click', async () => {
  if (!selectedSuspectId) {
    toast.warning('Please select a suspect.');
    return;
  }

  const reasoning = document.getElementById('accusation-reasoning').value.trim();
  if (reasoning.length < 10) {
    toast.warning('Please provide your reasoning (at least 10 characters).');
    return;
  }

  if (!confirm('Once submitted, this accusation is final. Are you sure?')) return;

  const btn = document.getElementById('submit-accusation-btn');
  setLoading(btn, true);
  try {
    const data = await api.submitAccusation(INV_ID, {
      suspectId: selectedSuspectId,
      reasoning,
    });

    // Update local state
    investigation.status = 'completed';
    investigation.accusation = { ...data, revealed: true };
    investigation.score = data.score;
    investigation.xpEarned = data.xpEarned;

    // Stop timer
    clearInterval(timerInterval);
    document.getElementById('workspace-status-badge').textContent = 'Completed';
    document.getElementById('workspace-status-badge').className = 'badge badge-success';

    // Show result
    showAccusationResult(data);
  } catch (err) {
    toast.error(err.message || 'Failed to submit accusation.');
  } finally {
    setLoading(btn, false);
  }
});

function showAccusationResult(data) {
  const wrapper = document.getElementById('accusation-form-wrapper');
  const resultEl = document.getElementById('accusation-result');
  const acc = data || investigation.accusation;
  const isCorrect = acc.isCorrect;

  const culpritSuspect = suspects.find(s => s.id === acc.culpritId || s.id === acc.suspectId);
  const correctSuspect = suspects.find(s => s.id === (data?.solution?.culpritId || acc.suspectId));

  wrapper.classList.add('hidden');
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = `
    <div class="accusation-result-card ${isCorrect ? '' : 'border border-danger'}">
      <div class="accusation-result-icon">${isCorrect ? '⚖️✓' : '❌'}</div>
      <h2 class="accusation-result-title" style="color:${isCorrect ? 'var(--success-text)' : 'var(--danger-text)'}">
        ${isCorrect ? 'Case Closed — Correct!' : 'Incorrect Accusation'}
      </h2>
      <p class="text-secondary">${isCorrect ? 'Your deduction was correct. Excellent detective work.' : 'The evidence pointed elsewhere. Review the solution below.'}</p>

      ${data?.solution?.explanation ? `
        <div class="accusation-result-explanation">
          <strong style="color:var(--amber)">Case Solution:</strong><br><br>
          ${data.solution.explanation}
        </div>
      ` : ''}

      ${data?.score !== undefined ? `
        <div class="score-breakdown">
          <div class="score-item">
            <div class="score-item-label">Final Score</div>
            <div class="score-item-value">${data.score}</div>
          </div>
          <div class="score-item">
            <div class="score-item-label">XP Earned</div>
            <div class="score-item-value">+${data.xpEarned}</div>
          </div>
          <div class="score-item">
            <div class="score-item-label">Clues Found</div>
            <div class="score-item-value">${investigation.discoveredClues?.length || 0} / ${allClues.length}</div>
          </div>
          <div class="score-item">
            <div class="score-item-label">Hints Used</div>
            <div class="score-item-value">${investigation.hintsUsed?.length || 0}</div>
          </div>
        </div>
      ` : ''}

      ${data?.newAchievements?.length ? `
        <div style="margin-top:var(--space-5)">
          <h4 style="margin-bottom:var(--space-3)">🏆 Achievements Unlocked</h4>
          <div class="flex flex-wrap gap-3">
            ${data.newAchievements.map(a => `
              <div class="badge badge-amber" style="padding:8px 12px;font-size:0.85rem">
                ${a.icon} ${a.name}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="flex gap-4 mt-6 justify-center">
        <a href="/pages/cases.html" class="btn btn-outline">Browse More Cases</a>
        <a href="/pages/dashboard.html" class="btn btn-primary">View Dashboard</a>
      </div>
    </div>
  `;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function clueTypeIcon(type) {
  const icons = { physical: '🔬', testimony: '🗣️', document: '📄', digital: '💻', trace: '🦶' };
  return icons[type] || '🔎';
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
