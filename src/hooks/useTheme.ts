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

function loadStoredDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DARK);
    if (stored !== null) return stored === 'true';
  } catch {}
  return true; // default dark
}

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(loadStoredTheme);
  const [isDark, setIsDark] = useState<boolean>(loadStoredDarkMode);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, themeId);
    } catch {}
  }, [themeId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DARK, String(isDark));
    } catch {}
  }, [isDark]);

  // Sync <html> class for Tailwind dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleDark = useCallback(() => setIsDark(prev => !prev), []);

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
