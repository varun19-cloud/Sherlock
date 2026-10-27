/**
 * MindMaze — UI Utilities
 * Toast notifications, modals, spinners, helpers
 */

// ── Toast Notifications ──
const toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 3500) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;

    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    el.innerHTML = `<span style="font-weight:600;opacity:0.7">${icons[type] || '•'}</span><span>${message}</span>`;

    getContainer().appendChild(el);

    setTimeout(() => {
      el.classList.add('fadeout');
      el.addEventListener('animationend', () => el.remove());
    }, duration);
  }

  return {
    success: (m, d) => show(m, 'success', d),
    error:   (m, d) => show(m, 'error', d),
    info:    (m, d) => show(m, 'info', d),
    warning: (m, d) => show(m, 'warning', d),
  };
})();

// ── Modal ──
function openModal(html, opts = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">${html}</div>`;

  if (opts.closeOnBackdrop !== false) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  }

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  return overlay;
}

function closeModal(overlay) {
  if (!overlay) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
  } else {
    overlay.remove();
  }
  document.body.style.overflow = '';
}

// ── Loading state on buttons ──
function setLoading(btn, loading) {
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px"></span> Loading…`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    btn.disabled = false;
  }
}

// ── Form error display ──
function showFormError(formEl, message) {
  let errEl = formEl.querySelector('.form-global-error');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.className = 'alert alert-error form-global-error';
    formEl.prepend(errEl);
  }
  errEl.textContent = message;
  errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearFormErrors(formEl) {
  formEl.querySelectorAll('.form-global-error').forEach(e => e.remove());
  formEl.querySelectorAll('.form-input.error').forEach(e => e.classList.remove('error'));
}

// ── Date/time helpers ──
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'],
  ];
  for (const [s, label] of intervals) {
    const n = Math.floor(seconds / s);
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ── XP bar renderer ──
function xpToNextRank(xp) {
  const thresholds = [0, 500, 1500, 3000, 5000];
  const labels = ['Rookie Detective', 'Junior Detective', 'Detective', 'Senior Detective', 'Chief Inspector'];
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp < thresholds[i + 1]) {
      const progress = ((xp - thresholds[i]) / (thresholds[i + 1] - thresholds[i])) * 100;
      return { current: labels[i], next: labels[i + 1], progress: Math.round(progress), remaining: thresholds[i + 1] - xp };
    }
  }
  return { current: 'Chief Inspector', next: null, progress: 100, remaining: 0 };
}

// ── Difficulty color ──
function difficultyBadge(difficulty) {
  const map = { Easy: 'success', Medium: 'amber', Hard: 'danger', Expert: 'danger' };
  return `<span class="badge badge-${map[difficulty] || 'muted'}">${difficulty}</span>`;
}

// ── Empty state renderer ──
function emptyState(icon, title, subtitle, action = '') {
  return `
    <div class="text-center" style="padding:var(--space-16) var(--space-6)">
      <div style="font-size:3rem;margin-bottom:var(--space-4)">${icon}</div>
      <h3 style="margin-bottom:var(--space-2)">${title}</h3>
      <p class="text-secondary" style="margin-bottom:var(--space-6)">${subtitle}</p>
      ${action}
    </div>
  `;
}

window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
window.setLoading = setLoading;
window.showFormError = showFormError;
window.clearFormErrors = clearFormErrors;
window.timeAgo = timeAgo;
window.formatDate = formatDate;
window.xpToNextRank = xpToNextRank;
window.difficultyBadge = difficultyBadge;
window.emptyState = emptyState;
