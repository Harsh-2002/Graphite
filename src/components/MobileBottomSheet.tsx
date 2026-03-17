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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full rounded-t-3xl ${ui.panelBg} shadow-2xl max-h-[85vh] flex flex-col animate-slide-up`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className={`w-9 h-1 rounded-full opacity-20 ${ui.tabInactive} bg-current`} />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 pb-4`}>
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${ui.btnSecondary} transition-all active:scale-90`}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className={`mx-6 border-t ${ui.panelBorder}`} />

        {/* Content */}
        <div className="overflow-y-auto px-6 pt-5 pb-8">
          {children}
        </div>

        {/* Safe area spacer — extends panel bg behind home indicator */}
        <div className="shrink-0 safe-area-bottom" />
      </div>
    </div>
  );
}
