import type React from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { UIClasses } from '../types/theme';

interface MobileBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  ui: UIClasses;
  children: React.ReactNode;
}

export function MobileBottomSheet({ open, onClose, title, ui, children }: MobileBottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    // Prevent body scroll when sheet is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full rounded-t-2xl ${ui.panelBg} shadow-2xl max-h-[85vh] flex flex-col animate-slide-up`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className={`w-10 h-1 rounded-full opacity-30 ${ui.tabInactive} bg-current`} />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 pb-3 border-b ${ui.panelBorder}`}>
          <h3 className="text-sm font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${ui.dropdownHover} transition-colors`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-4 safe-area-bottom">
          {children}
        </div>
      </div>
    </div>
  );
}
