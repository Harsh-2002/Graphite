import { useState, useRef, useEffect } from 'react';
import { LayoutTemplate, ChevronDown } from 'lucide-react';
import type { UIClasses } from '../types/theme';
import { templates } from '../data/templates';

interface TemplateDropdownProps {
  onSelect: (code: string) => void;
  currentCode: string;
  ui: UIClasses;
}

export function TemplateDropdown({ onSelect, currentCode, ui }: TemplateDropdownProps) {
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

  const handleSelect = (code: string) => {
    const trimmed = currentCode.trim();
    const isTemplate = templates.some(t => t.code.trim() === trimmed);
    if (trimmed && !isTemplate) {
      if (!window.confirm('Replace current diagram with template?')) {
        setOpen(false);
        return;
      }
    }
    onSelect(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all duration-150 cursor-pointer ${ui.btnSecondary}`}
      >
        <LayoutTemplate size={12} />
        Templates
        <ChevronDown
          size={11}
          className={`opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className={`absolute left-0 top-full mt-1.5 z-50 min-w-[170px] rounded-lg border shadow-xl ${ui.dropdownBg} ${ui.dropdownBorder} py-1 overflow-hidden`}>
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors duration-100 cursor-pointer ${ui.dropdownText} ${ui.dropdownHover}`}
            >
              <span className="font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
