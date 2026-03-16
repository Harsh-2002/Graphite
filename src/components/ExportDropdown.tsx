import { useState, useRef, useEffect } from 'react';
import { Download, Check, ChevronDown, Image, FileCode } from 'lucide-react';
import type { UIClasses } from '../types/theme';

interface ExportDropdownProps {
  disabled: boolean;
  onExportPNG: () => void;
  onExportSVG: () => void;
  ui: UIClasses;
}

export function ExportDropdown({ disabled, onExportPNG, onExportSVG, ui }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [exported, setExported] = useState<string | null>(null);
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

  const handleExport = (format: 'png' | 'svg') => {
    if (format === 'png') onExportPNG();
    else onExportSVG();
    setExported(format);
    setTimeout(() => setExported(null), 2000);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm ${ui.btnPrimary}`}
      >
        {exported ? <Check size={12} /> : <Download size={12} />}
        {exported ? `Exported .${exported}` : 'Export'}
        <ChevronDown
          size={11}
          className={`opacity-60 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && !disabled && (
        <div className={`absolute right-0 top-full mt-1.5 z-50 min-w-[130px] rounded-lg border shadow-xl ${ui.dropdownBg} ${ui.dropdownBorder} py-1 overflow-hidden`}>
          <button
            onClick={() => handleExport('png')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors duration-100 cursor-pointer ${ui.dropdownText} ${ui.dropdownHover}`}
          >
            <Image size={13} className="shrink-0 opacity-60" />
            <span>
              <span className="font-medium">PNG</span>
              <span className="opacity-50 ml-1">3x</span>
            </span>
          </button>
          <button
            onClick={() => handleExport('svg')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors duration-100 cursor-pointer ${ui.dropdownText} ${ui.dropdownHover}`}
          >
            <FileCode size={13} className="shrink-0 opacity-60" />
            <span>
              <span className="font-medium">SVG</span>
              <span className="opacity-50 ml-1">vector</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
