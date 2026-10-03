(function () {
  const THEME_STORAGE_KEY = 'theme';

  const THEME_ICONS = {
    auto: '/assets/mode-auto.svg',
    light: '/assets/mode-lite.svg',
    dark: '/assets/mode-dark.svg'
  };

  function getStoredTheme() {
    try {
      const val = localStorage.getItem(THEME_STORAGE_KEY);
      if (val === 'light' || val === 'dark' || val === 'auto') {
        return val;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      // ignore
    }
  }

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
    document.documentElement.setAttribute('data-bs-theme', effectiveTheme);

    const activeIcon = document.getElementById('theme-icon-active');
    if (activeIcon && THEME_ICONS[theme]) {
      activeIcon.src = THEME_ICONS[theme];
    }
  }

  // Apply immediately to prevent theme flash
  const initialTheme = getStoredTheme() || 'auto';
  applyTheme(initialTheme);

  function initTheme() {
    applyTheme(getStoredTheme() || 'auto');

    document.querySelectorAll('[data-bs-theme-value]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const theme = item.getAttribute('data-bs-theme-value');
        if (theme) {
          setStoredTheme(theme);
          applyTheme(theme);
        }
      });
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme() || 'auto';
        if (storedTheme === 'auto') {
          applyTheme('auto');
        }
      });
    }
  }

  function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const container = document.querySelector('.cont');
    if (!container) return;

    const entries = Array.from(container.querySelectorAll(':scope > .row'));
    let matches = [];
    let matchIndex = -1;

    function applySearch() {
      const query = searchInput.value.trim().toLowerCase();
      matches = [];
      matchIndex = -1;

      entries.forEach(entry => {
        if (!query) {
          entry.style.opacity = '';
          return;
        }
        const text = entry.textContent.toLowerCase();
        if (text.includes(query)) {
          entry.style.opacity = '';
          matches.push(entry);
        } else {
          entry.style.opacity = '0.15';
        }
      });

      if (matches.length > 0) {
        matchIndex = 0;
        scrollToMatch();
      }
    }

    function scrollToMatch() {
      if (matchIndex < 0 || matchIndex >= matches.length) return;
      matches[matchIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    searchInput.addEventListener('input', applySearch);

    searchInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || matches.length === 0) return;
      e.preventDefault();
      if (e.shiftKey) {
        matchIndex = (matchIndex - 1 + matches.length) % matches.length;
      } else {
        matchIndex = (matchIndex + 1) % matches.length;
      }
      scrollToMatch();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initTheme(); initSearch(); });
  } else {
    initTheme();
    initSearch();
  }
})();
