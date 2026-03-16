# Graphite

A fast, themeable Mermaid diagram editor. Write Mermaid syntax, see a live preview, and export high-quality PNGs — all in the browser.

## Features

- Live preview with instant rendering via [beautiful-mermaid](https://github.com/nicepkg/beautiful-mermaid)
- 5 color themes (Graphite, Ocean, Forest, Lavender, Sunset) with light and dark variants
- Independent diagram theme selection from beautiful-mermaid's built-in themes
- Copy PNG to clipboard or export as file (3x resolution)
- Responsive layout — horizontal split on desktop, vertical on mobile
- Preferences persisted to localStorage

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
cp .env.example .env.local   # configure GEMINI_API_KEY if needed
npm run dev                   # starts on http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run clean` | Remove `dist/` |

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- beautiful-mermaid (Mermaid SVG rendering)
- react-resizable-panels
- lucide-react (icons)
