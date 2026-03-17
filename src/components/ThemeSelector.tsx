import type { ThemeId } from '../types/theme';
import THEMES from '../themes';

interface ThemeSelectorProps {
  themeId: ThemeId;
  onSelect: (id: ThemeId) => void;
  large?: boolean;
}

export function ThemeSelector({ themeId, onSelect, large }: ThemeSelectorProps) {
  return (
    <div className={`flex items-center ${large ? 'gap-3' : 'gap-1.5'}`}>
      {(Object.keys(THEMES) as ThemeId[]).map(id => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`rounded-full ${THEMES[id].dot} border-2 transition-all duration-150 ${
            large ? 'w-8 h-8' : 'w-4.5 h-4.5'
          } ${
            themeId === id
              ? 'border-white/80 scale-110 shadow-md'
              : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
          }`}
          title={THEMES[id].name}
        />
      ))}
    </div>
  );
}
