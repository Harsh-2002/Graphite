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
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-2.5 transition-all duration-150 active:scale-95 active:opacity-70 ${
          activeTab === 'editor' ? ui.tabActive : ui.tabInactive
        }`}
      >
        <div className={`flex items-center justify-center w-16 h-8 rounded-full transition-all duration-200 ${
          activeTab === 'editor' ? `${ui.tabIndicator} ${ui.tabIndicatorText}` : ''
        }`}>
          <Code size={18} strokeWidth={activeTab === 'editor' ? 2.5 : 1.5} />
        </div>
        <span className={`text-[11px] font-semibold ${activeTab === 'editor' ? '' : 'font-medium'}`}>Editor</span>
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-2.5 transition-all duration-150 active:scale-95 active:opacity-70 ${
          activeTab === 'preview' ? ui.tabActive : ui.tabInactive
        }`}
      >
        <div className={`flex items-center justify-center w-16 h-8 rounded-full transition-all duration-200 ${
          activeTab === 'preview' ? `${ui.tabIndicator} ${ui.tabIndicatorText}` : ''
        }`}>
          <Eye size={18} strokeWidth={activeTab === 'preview' ? 2.5 : 1.5} />
        </div>
        <span className={`text-[11px] font-semibold ${activeTab === 'preview' ? '' : 'font-medium'}`}>Preview</span>
      </button>
    </div>
  );
}
