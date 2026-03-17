import { useState, useRef, useEffect } from 'react';
import { THEMES as BM_THEMES } from 'beautiful-mermaid';
import { ChevronDown, Check, Palette } from 'lucide-react';
import type { UIClasses } from '../types/theme';

interface DiagramThemeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  ui: UIClasses;
  autoLabel: string;
}

function isDarkBg(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

interface ThemeOption {
  value: string;
  label: string;
  dark: boolean;
}

const OPTIONS: ThemeOption[] = [
  { value: 'auto', label: 'Auto', dark: false },
  ...Object.entries(BM_THEMES).map(([key, theme]) => ({
    value: key,
    label: key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    dark: isDarkBg((theme as { bg: string }).bg),
  })),
];

export function DiagramThemeDropdown({ value, onChange, ui, autoLabel }: DiagramThemeDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = OPTIONS.find(o => o.value === value);
  const displayLabel = value === 'auto' ? `Auto (${autoLabel})` : selected?.label ?? value;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 cursor-pointer min-w-[170px] ${ui.dropdownBorder} ${ui.dropdownText} ${ui.dropdownBg} ${ui.dropdownHover}`}
      >
        <Palette size={13} className="shrink-0 opacity-50" />
        <span className="flex-1 text-left truncate">{displayLabel}</span>
        <ChevronDown
          size={12}
          className={`shrink-0 opacity-40 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full mt-2 z-50 w-[220px] max-h-[340px] overflow-y-auto rounded-xl border shadow-2xl ${ui.panelBg} ${ui.panelBorder} py-1.5 px-1.5 scrollbar-none`}
          style={{ scrollbarWidth: 'none' }}
        >
          {OPTIONS.map(opt => {
            const isSelected = value === opt.value;
            const label = opt.value === 'auto' ? `Auto (${autoLabel})` : opt.label;

            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left rounded-lg transition-colors duration-100 cursor-pointer ${
                  isSelected
                    ? `${ui.iconBg} ${ui.iconText}`
                    : `${ui.dropdownText} ${ui.dropdownHover}`
                }`}
              >
                {isSelected && <Check size={13} strokeWidth={2.5} className="shrink-0" />}
                <span className="flex-1 truncate">{label}</span>
                {opt.value !== 'auto' && (
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${
                    isSelected ? 'opacity-60' : 'opacity-30'
                  }`}>
                    {opt.dark ? 'dark' : 'light'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function isDiagramThemeDark(themeKey: string): boolean | null {
  if (themeKey === 'auto') return null;
  const theme = BM_THEMES[themeKey] as { bg: string } | undefined;
  if (!theme) return null;
  return isDarkBg(theme.bg);
}
