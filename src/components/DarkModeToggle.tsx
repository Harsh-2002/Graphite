import { Sun, Moon } from 'lucide-react';
import type { UIClasses } from '../types/theme';

interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  ui: UIClasses;
}

export function DarkModeToggle({ isDark, onToggle, ui }: DarkModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative flex items-center w-12 h-6 rounded-full ${ui.toggleBg} transition-colors duration-200 cursor-pointer`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className={`absolute flex items-center justify-center w-5 h-5 rounded-full ${ui.toggleKnob} shadow-sm transition-transform duration-200 ${isDark ? 'translate-x-6' : 'translate-x-0.5'}`}
      >
        {isDark ? (
          <Moon size={11} className="text-zinc-700" />
        ) : (
          <Sun size={11} className="text-amber-500" />
        )}
      </span>
    </button>
  );
}
