# PhD Application Tracker

A mobile-first Progressive Web App for managing PhD applications across multiple institutions.

## About

Most PhD applicants juggle 8–15 applications simultaneously across incompatible portals, spreadsheets, and email threads. **PhD Application Tracker** consolidates every application, deadline, document requirement, interview slot, and result into a single, beautifully structured dashboard.

## Project Structure

```
phd-tracker/
├── index.html                   # Single HTML entry point
├── css/                        # All styling (no inline styles)
│   ├── base/                   # Design tokens, reset, typography
│   ├── layout/                 # Shell, grid utilities
│   ├── components/             # Component styles
│   ├── screens/                # Screen-specific styles
│   └── themes/                 # Light/dark themes
├── js/                         # All JavaScript (ES modules)
│   ├── main.js                 # Entry point
│   ├── router.js               # Client-side router
│   ├── services/               # Pure business logic
│   ├── components/             # Reusable UI components
│   ├── screens/                # Screen controllers
│   └── utils/                  # Helper functions
├── assets/                     # Icons, illustrations
├── data/                       # Optional data files
└── manifest.json              # PWA manifest (coming soon)
```

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, BEM, no frameworks
- **Vanilla JavaScript** - ES2022 modules, no build step
- **No dependencies** - Pure web APIs

## Key Features (Phase 0 ✓)

- ✓ Full project scaffolding
- ✓ Bottom navigation with 4 screens
- ✓ Complete design system (tokens, colors, spacing)
- ✓ Storage service with localStorage persistence
- ✓ Router and screen system
- ✓ Application CRUD service
- ✓ Calendar event aggregation
- ✓ Stats and streak tracking
- ✓ Toast notifications
- ✓ Modal system

## Getting Started

### Running the App

1. Open `index.html` in a modern web browser
2. Or serve with a local web server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Node.js
   npx http-server
   ```

3. Navigate to `http://localhost:8000`

### Development

- All code is in `js/` and `css/` directories
- No build tools required
- Modify CSS tokens in `css/base/tokens.css` to change colors/spacing
- Services are pure functions (no DOM dependencies) — easy to test
- Components handle DOM rendering

## Implementation Roadmap

- **Phase 0** ✓ - Project scaffolding (routing, design system)
- **Phase 1** - Data layer & CRUD (Days 2–3)
- **Phase 2** - Detail screen & document tracking (Day 4)
- **Phase 3** - Calendar view & conflict detection (Days 5–6)
- **Phase 4** - Dashboard & gamification (Day 7)
- **Phase 5** - PWA & theming (Days 8–9)

## Architecture Principles

1. **Viewport Lock**: Body doesn't scroll; all scrolling is contained
2. **Mobile First**: Responsive from 320px+
3. **No Frameworks**: Demonstrates clean vanilla JS architecture
4. **Services First**: Pure logic separated from components
5. **One-Way Data Flow**: Services → Components → DOM
6. **Design Tokens**: All visual properties centralized in CSS

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES2022 support (const, arrow functions, template literals, modules).

## License

MIT

---

For detailed architecture decisions, see the `phd_tracker_blueprint.md` master specification document.
