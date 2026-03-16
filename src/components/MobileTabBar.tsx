import { Code, Eye } from 'lucide-react';
import type { UIClasses } from '../types/theme';

export type MobileTab = 'editor' | 'preview';

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  ui: UIClasses;
}

export function MobileTabBar({ activeTab, onTabChange, ui }: MobileTabBarProps) {
  return (
    <div className={`flex border-t ${ui.mobileToolbarBorder} ${ui.mobileToolbarBg} shrink-0 transition-colors duration-200 safe-area-bottom`}>
      <button
        onClick={() => onTabChange('editor')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-150 relative ${
          activeTab === 'editor' ? ui.tabActive : ui.tabInactive
        }`}
      >
        <Code size={20} strokeWidth={activeTab === 'editor' ? 2.5 : 1.5} />
        <span className="text-[11px] font-medium">Editor</span>
        {activeTab === 'editor' && (
          <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full ${ui.tabIndicator}`} />
        )}
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-150 relative ${
          activeTab === 'preview' ? ui.tabActive : ui.tabInactive
        }`}
      >
        <Eye size={20} strokeWidth={activeTab === 'preview' ? 2.5 : 1.5} />
        <span className="text-[11px] font-medium">Preview</span>
        {activeTab === 'preview' && (
          <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full ${ui.tabIndicator}`} />
        )}
      </button>
    </div>
  );
}
