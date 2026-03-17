import { useState, useEffect, useCallback } from 'react';
import type { ThemeId, UIClasses, MermaidColors } from '../types/theme';
import THEMES from '../themes';

const STORAGE_KEY_THEME = 'graphite-theme';
const STORAGE_KEY_DARK = 'graphite-dark-mode';

function loadStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_THEME);
    if (stored && stored in THEMES) return stored as ThemeId;
  } catch {}
  return 'zinc';
}

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function hasStoredDarkMode(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_DARK) !== null;
  } catch {}
  return false;
}

function loadStoredDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DARK);
    if (stored !== null) return stored === 'true';
  } catch {}
  return getSystemDark();
}

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(loadStoredTheme);
  const [isDark, setIsDark] = useState<boolean>(loadStoredDarkMode);
  const [userOverride, setUserOverride] = useState<boolean>(hasStoredDarkMode);

  // Follow system preference when the user hasn't explicitly toggled
  useEffect(() => {
    if (userOverride) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [userOverride]);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, themeId);
    } catch {}
  }, [themeId]);

  useEffect(() => {
    if (userOverride) {
      try {
        localStorage.setItem(STORAGE_KEY_DARK, String(isDark));
      } catch {}
    }
  }, [isDark, userOverride]);

  // Sync <html> class for Tailwind dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleDark = useCallback(() => {
    setUserOverride(true);
    setIsDark(prev => !prev);
  }, []);

  const theme = THEMES[themeId];
  const ui: UIClasses = isDark ? theme.ui.dark : theme.ui.light;
  const mermaidColors: MermaidColors = isDark ? theme.mermaid.dark : theme.mermaid.light;

  return {
    themeId,
    setThemeId,
    isDark,
    toggleDark,
    theme,
    ui,
    mermaidColors,
  };
}
