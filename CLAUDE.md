# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Vite on port 3000)
- **Build:** `npm run build`
- **Lint (type-check):** `npm run lint` (runs `tsc --noEmit`)
- **Clean:** `npm run clean` (removes `dist/`)
- **Preview prod build:** `npm run preview`

There is no test runner configured.

## Architecture

Graphite is a single-page Mermaid diagram editor built with React 19, TypeScript, Vite, and Tailwind CSS v4.

**Project structure:**
- `src/App.tsx` — root component, wires together editor + preview panels via `react-resizable-panels`
- `src/components/` — UI components: `Editor`, `DarkModeToggle`, `ThemeSelector`, `DiagramThemeDropdown`
- `src/hooks/` — `useTheme` (theme + dark mode state with localStorage persistence), `useMobile` (responsive breakpoint)
- `src/themes/` — theme definitions (5 color themes, each with light/dark UI classes and Mermaid rendering colors)
- `src/types/` — TypeScript interfaces for themes
- `src/utils/` — `svgToPng` (canvas-based SVG-to-PNG conversion at 3x scale), `prismMermaid` (custom Mermaid grammar for Prism)

**Theming:** 5 color themes (zinc/Graphite, blue/Ocean, emerald/Forest, violet/Lavender, orange/Sunset). Each has separate light and dark variants for both Mermaid rendering colors and Tailwind UI class strings. Diagram themes can also be set independently via `beautiful-mermaid`'s built-in themes. Dark mode is the default; user preference is persisted to localStorage.

**Path alias:** `@/*` maps to the project root (configured in both `tsconfig.json` and `vite.config.ts`).

**Deployment:** GitHub Pages via `.github/workflows/deploy.yml`. The Vite `base` is set to `/Graphite/` when `GITHUB_PAGES=true`.
