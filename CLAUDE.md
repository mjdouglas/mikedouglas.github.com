# CLAUDE.md

Personal portfolio site featuring an interactive 3D Rubik's Cube built with Three.js and the Kociemba solving algorithm.

## Architecture

- **Vanilla JS + Three.js** - No framework, ES modules
- **Vite** - Build system and dev server
- **All UI styles are inline in `index.html`** - No CSS modules or preprocessors
- **UI uses fixed positioning** with z-index layering (header: 100, modals: 200+)
- **Responsive breakpoint**: 768px (mobile vs desktop)

### Key Files

- `index.html` - Main entry, contains all CSS and UI markup
- `js/main.js` - Three.js scene setup, controls, event handlers
- `js/colorPalettes.js` - Cube color themes with Spotify track pairings
- `js/solver/KociembaSolver.js` - Rubik's cube solving algorithm
- `js/animation/` - Cube rotation and move animation

## Build & Test Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests (Vitest)
- `npx playwright test` - Run all e2e tests
- `npx playwright test e2e/screenshots.spec.js` - Generate layout screenshots

## Pre-Commit Checklist

Before committing UI changes, run the screenshot tests:

```bash
npm run build && npx playwright test e2e/screenshots.spec.js
```

Then review `screenshots/desktop.png` and `screenshots/mobile.png` to verify:
- No unintended layout changes
- Elements are properly positioned on both viewport sizes
- No overlapping or crowded elements on mobile

## UI Conventions

- **Font**: Orbitron (Google Fonts) for all UI text
- **Colors**: rgba white on dark (#1a1a1a) background, low opacity (0.25-0.4) for subtle appearance
- **Hover states**: Increase opacity to 0.7-0.85
- **Transitions**: 0.2s-0.3s ease for interactions
