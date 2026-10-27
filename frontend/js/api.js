/**
 * MindMaze API Client
 * Centralized fetch wrapper with auth token management
 */

const API_BASE = '/api';

const api = {
  _token: null,

  setToken(token) {
    this._token = token;
    if (token) {
      localStorage.setItem('mm_token', token);
    } else {
      localStorage.removeItem('mm_token');
    }
  },

  getToken() {
    if (!this._token) {
      this._token = localStorage.getItem('mm_token');
    }
    return this._token;
  },

  async request(method, endpoint, body = null, opts = {}) {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
      method,
      headers,
      ...opts,
    };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || `API Error: ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  },

  get(endpoint)             { return this.request('GET', endpoint); },
  post(endpoint, body)      { return this.request('POST', endpoint, body); },
  put(endpoint, body)       { return this.request('PUT', endpoint, body); },
  delete(endpoint)          { return this.request('DELETE', endpoint); },

  // Auth
  register(data)            { return this.post('/auth/register', data); },
  login(data)               { return this.post('/auth/login', data); },
  getMe()                   { return this.get('/auth/me'); },

  // Cases
  getCases(params = {})     {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/cases${qs ? '?' + qs : ''}`);
  },
  getCase(caseId)           { return this.get(`/cases/${caseId}`); },
  getCaseSuspects(caseId)   { return this.get(`/cases/${caseId}/suspects`); },
  getCaseClues(caseId)      { return this.get(`/cases/${caseId}/clues`); },

  // Investigations
  createInvestigation(caseId) { return this.post('/investigations', { caseId }); },
  getMyInvestigations()     { return this.get('/investigations'); },
  getInvestigation(id)      { return this.get(`/investigations/${id}`); },

  discoverClue(invId, clueId) { return this.post(`/investigations/${invId}/clues/${clueId}`); },
  submitTimeline(invId, order) { return this.put(`/investigations/${invId}/timeline`, { order }); },
  addConnection(invId, data)  { return this.post(`/investigations/${invId}/connections`, data); },
  removeConnection(invId, connId) { return this.delete(`/investigations/${invId}/connections/${connId}`); },
  updateBoardPositions(invId, positions) { return this.put(`/investigations/${invId}/board`, { positions }); },

  getNotes(invId)           { return this.get(`/investigations/${invId}/notes`); },
  addNote(invId, data)      { return this.post(`/investigations/${invId}/notes`, data); },
  updateNote(invId, noteId, data) { return this.request('PUT', `/investigations/${invId}/notes/${noteId}`, data); },
  deleteNote(invId, noteId) { return this.delete(`/investigations/${invId}/notes/${noteId}`); },

  useHint(invId, hintId)    { return this.post(`/investigations/${invId}/hints/${hintId}`); },
  submitAccusation(invId, data) { return this.post(`/investigations/${invId}/accusations`, data); },

  // Leaderboard / Dashboard
  getLeaderboard(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/leaderboard${qs ? '?' + qs : ''}`);
  },
  getDashboard()            { return this.get('/dashboard'); },
};

window.api = api;
