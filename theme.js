// ===== THEME SYSTEM =====
const THEME_KEY = 'kirobiler_theme';

function getTheme() {
  return localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function initTheme() {
  setTheme(getTheme());
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      setTheme(getTheme() === 'light' ? 'dark' : 'light');
    });
  }
}

document.addEventListener('DOMContentLoaded', initTheme);
