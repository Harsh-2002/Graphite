export interface MermaidColors {
  fg: string;
  line: string;
  border: string;
  surface: string;
  accent: string;
}

export interface UIClasses {
  appBg: string;
  appText: string;
  selection: string;
  panelBg: string;
  panelBorder: string;
  iconBg: string;
  iconText: string;
  resizeHandle: string;
  previewBg: string;
  previewHeaderBg: string;
  previewTitle: string;
  btnSecondary: string;
  btnPrimary: string;
  editorLineNum: string;
  editorText: string;
  editorBg: string;
  dropdownBg: string;
  dropdownBorder: string;
  dropdownHover: string;
  dropdownText: string;
  toggleBg: string;
  toggleKnob: string;
}

export interface Theme {
  name: string;
  dot: string;
  mermaid: {
    light: MermaidColors;
    dark: MermaidColors;
  };
  ui: {
    light: UIClasses;
    dark: UIClasses;
  };
}

export type ThemeId = 'zinc' | 'blue' | 'emerald' | 'violet' | 'orange';
