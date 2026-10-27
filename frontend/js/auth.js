/**
 * MindMaze — Auth State Manager
 */

const auth = {
  _user: null,

  getUser() {
    if (this._user) return this._user;
    const stored = localStorage.getItem('mm_user');
    if (stored) {
      try { this._user = JSON.parse(stored); } catch (e) {}
    }
    return this._user;
  },

  setUser(user) {
    this._user = user;
    if (user) {
      localStorage.setItem('mm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mm_user');
    }
  },

  isLoggedIn() {
    return !!api.getToken() && !!this.getUser();
  },

  logout() {
    api.setToken(null);
    this.setUser(null);
    window.location.href = '/';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/pages/auth.html';
      return false;
    }
    return true;
  },

  async refreshUser() {
    try {
      const data = await api.getMe();
      this.setUser(data.user);
      return data.user;
    } catch (e) {
      this.logout();
    }
  },
};

window.auth = auth;

// Update navbar based on auth state
function updateNavbar() {
  const user = auth.getUser();
  const guestLinks = document.querySelectorAll('.nav-guest');
  const authLinks  = document.querySelectorAll('.nav-auth');
  const usernameEl = document.querySelectorAll('.nav-username');

  guestLinks.forEach(el => el.classList.toggle('hidden', !!user));
  authLinks.forEach(el => el.classList.toggle('hidden', !user));
  usernameEl.forEach(el => { if (user) el.textContent = user.username; });
}

document.addEventListener('DOMContentLoaded', updateNavbar);
