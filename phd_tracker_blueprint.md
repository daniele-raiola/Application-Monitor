# PhD Application Tracker — Master Blueprint

> **For AI Coding Assistant:** This document is the single source of truth for building the PhD Application Tracker. Read every section before writing a single line of code. Each section's decisions are intentional and interdependent. Do not deviate from the architectural constraints without explicit justification.

---

# Project Overview

## Elevator Pitch

Most PhD applicants juggle 8–15 applications simultaneously across incompatible portals, spreadsheets, email threads, and calendar apps. The cognitive overhead is enormous and the cost of a missed deadline is catastrophic — it is a one-year setback.

**PhD Application Tracker** is a mobile-first, offline-capable Progressive Web App (PWA) that consolidates every application, deadline, document requirement, interview slot, and result publication into a single, beautifully structured dashboard. It turns the chaotic "application season" into a manageable, gamified workflow.

## Goals

| Priority | Goal |
|----------|------|
| P0 | Zero missed deadlines — every date is visible, flagged, and notified |
| P0 | One-glance status awareness across all applications |
| P1 | Conflict detection for overlapping interviews or exam dates |
| P1 | Reward-driven loop to motivate continuous data entry and status updates |
| P2 | Offline-first data persistence (no backend required at V1) |
| P2 | PWA installability — works like a native app on mobile |

---

## User Stories & The Learning Loop

### The Learning Loop Model Applied

The app is architected around the **Hook Model** (Nir Eyal) adapted as a *Learning Loop*:

```
ACTION → FEEDBACK → TRIGGER → INVESTMENT
```

Every user action produces immediate, satisfying feedback, which in turn surfaces the next logical trigger, encouraging further investment in the app's data — making the app progressively more valuable to the user.

### Story Map

| Loop Stage | User Story | Implementation |
|------------|------------|----------------|
| **TRIGGER** | "I just found a new PhD program I'm interested in." | Home screen FAB pulses subtly when 0 applications exist. Empty state shows a compelling CTA with a rocket illustration. |
| **ACTION** | "I tap the FAB and fill in the university and program details." | Modal slide-up form with inline validation and autosave. Minimal required fields to reduce friction. |
| **FEEDBACK** | "I see the new card appear in my dashboard with a satisfying animation." | Card animates in with a spring effect. A toast notification says *"🎉 Application added! Set your deadline next."* |
| **TRIGGER** | "The toast nudges me to add a deadline immediately." | The toast contains a shortcut button: *"Add Deadline →"*. The new card visually pulses to draw attention. |
| **ACTION** | "I add the submission deadline date." | Inline date picker on the card. One tap to confirm. |
| **FEEDBACK** | "The calendar dot appears. The card now shows a countdown badge." | Calendar view gains a dot. Countdown badge on card reads: *"47 days left"* in a green chip. |
| **INVESTMENT** | "I've now added 3 applications and the app is genuinely useful to me." | The dashboard's progress ring (total submitted / total applied) starts filling. A streak counter rewards daily check-ins. |
| **TRIGGER** | "A deadline is 7 days away. I get a push notification." | PWA push notification (or in-app banner) triggers re-engagement. Status chip on card glows amber. |
| **ACTION** | "I move the status from 'Drafting' to 'Submitted'." | Status stepper on card. One tap per state transition. |
| **FEEDBACK** | "A confetti burst plays. The progress ring advances. The card moves to the 'Submitted' column." | Confetti animation via `canvas-confetti`. Toast: *"Submitted! 🎓 One step closer."* |
| **INVESTMENT** | "My data is now a real, accurate record of my academic journey." | The app feels too valuable to abandon. Every future check-in reinforces the habit. |

---

## Core Features & Requirements

### Feature 1 — Application Management

- **Kanban-style status pipeline** with the following ordered states:
  ```
  Planning → Drafting → Submitted → Under Review → Interviewing → Accepted → Rejected
  ```
- Applications can be moved between states via a **status stepper** (previous / next arrows) directly on the card, or via a full **Edit Modal**.
- **Terminal states** (Accepted, Rejected) are visually distinct — Accepted cards display a gold border; Rejected cards are visually muted (reduced opacity, greyscale university logo).
- A **filter/sort bar** on the Applications screen allows filtering by status, sorting by deadline (ASC/DESC), or sorting by program name.
- **Swipe gestures** on mobile: swipe left on a card to reveal quick-delete; swipe right to advance status one step.

### Feature 2 — Application Detail Tracking

Each application record stores the following fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID | Auto | Generated on creation |
| `universityName` | String | Yes | |
| `programName` | String | Yes | e.g., "PhD in Computational Neuroscience" |
| `department` | String | No | |
| `country` | String | No | ISO 3166-1 alpha-2 |
| `applicationPortalURL` | URL | No | Direct link to the portal |
| `submissionDeadline` | ISO Date | Yes | Used for countdown and calendar |
| `resultsPublicationDate` | ISO Date | No | |
| `interviewDate` | ISO Date | No | Triggers conflict detection |
| `oralExamDate` | ISO Date | No | Triggers conflict detection |
| `status` | Enum | Yes | See pipeline above |
| `requiredDocuments` | Array\<Object\> | No | `{name, completed: bool}` |
| `notes` | String | No | Rich-text markdown supported |
| `tags` | Array\<String\> | No | e.g., "fully-funded", "EU", "top-10" |
| `createdAt` | ISO Datetime | Auto | |
| `updatedAt` | ISO Datetime | Auto | |
| `statusHistory` | Array\<Object\> | Auto | `{status, timestamp}` — immutable audit log |

- **Document Checklist**: Each document item has a name and a boolean `completed` flag, rendered as a tappable checklist. Completion percentage shown as a mini progress bar on the card.
- **Notes**: Support basic Markdown rendering (bold, italic, links, bullet lists) using a lightweight renderer. No WYSIWYG editor required.
- **Portal Quick-Launch**: Tapping the portal URL opens it in a new tab. The icon visually distinguishes HTTP from HTTPS links.

### Feature 3 — Interactive Calendar View

- **Month view** as the default calendar mode, with a **List/Agenda view** toggle.
- Each date with an event displays a colored dot beneath it:
  - 🔴 Red dot = Submission Deadline
  - 🟠 Orange dot = Interview Date
  - 🟡 Yellow dot = Oral Exam Date
  - 🟢 Green dot = Results Publication
- **Conflict Detection**: When two or more events of *any* type fall on the same date, the day cell displays a ⚠️ warning indicator and is highlighted with an amber background. Tapping it opens a conflict-detail sheet listing all overlapping events.
- **Tapping a date** with events opens a **bottom sheet** (not a new page) listing all events on that day with their associated application names and links to the detail view.
- **Weeks navigation**: The calendar supports month-by-month navigation via left/right swipe or chevron buttons.
- **Upcoming Events Widget**: Below the month grid, a horizontal scroll strip shows the next 5 upcoming events as compact chips — tapping a chip deep-links to the relevant application.

---

## Data Model / Database Schema

### Storage Strategy

**V1** uses `localStorage` with a structured JSON schema — no backend, no auth. The storage key is `phd_tracker_v1`. All data is serialized as a single top-level object.

> **Migration Path**: The schema is versioned (`schemaVersion` field). Future migrations to IndexedDB or a backend (Supabase, Firebase) must be handled via a `migrate()` function in `js/services/storage.js`.

### Top-Level Storage Object

```json
{
  "schemaVersion": 1,
  "lastUpdated": "2025-09-15T14:23:00Z",
  "settings": {
    "theme": "system",
    "defaultView": "dashboard",
    "notificationsEnabled": false,
    "streakLastCheckin": "2025-09-14"
  },
  "stats": {
    "streakDays": 3,
    "totalAdded": 7,
    "totalSubmitted": 2,
    "totalAccepted": 0
  },
  "applications": [
    {
      "id": "uuid-v4-string",
      "universityName": "ETH Zurich",
      "programName": "PhD in Machine Learning",
      "department": "Dept. of Computer Science",
      "country": "CH",
      "applicationPortalURL": "https://www.ethz.ch/apply",
      "submissionDeadline": "2025-12-01",
      "resultsPublicationDate": "2026-02-15",
      "interviewDate": null,
      "oralExamDate": null,
      "status": "Drafting",
      "requiredDocuments": [
        { "id": "doc-uuid-1", "name": "CV / Resume", "completed": true },
        { "id": "doc-uuid-2", "name": "Statement of Purpose", "completed": false },
        { "id": "doc-uuid-3", "name": "3 Letters of Recommendation", "completed": false }
      ],
      "notes": "Contact Prof. Müller about research fit before applying.",
      "tags": ["fully-funded", "EU", "top-5"],
      "createdAt": "2025-09-01T09:00:00Z",
      "updatedAt": "2025-09-10T16:45:00Z",
      "statusHistory": [
        { "status": "Planning", "timestamp": "2025-09-01T09:00:00Z" },
        { "status": "Drafting", "timestamp": "2025-09-10T16:45:00Z" }
      ]
    }
  ]
}
```

### Entity Relationships (Conceptual ERD)

```
AppStore (Singleton)
│
├── settings: Settings (1:1)
├── stats: Stats (1:1)
└── applications: Application[] (1:N)
    └── requiredDocuments: Document[] (1:N per Application)
    └── statusHistory: StatusEvent[] (1:N per Application, append-only)
```

---

## Tech Stack & Folder Structure

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Markup | **HTML5** (semantic) | Strict separation; no JSX |
| Styling | **CSS3** (custom properties + BEM) | No frameworks; zero runtime cost |
| Logic | **Vanilla JavaScript ES2022** (modules) | No build step required for V1; use `type="module"` |
| Date Handling | **Temporal API polyfill** (`@js-temporal/polyfill`) | Robust, immutable date math; avoids `Date` pitfalls |
| Confetti | **canvas-confetti** (CDN) | Lightweight; <5KB gzipped |
| Markdown Rendering | **marked.js** (CDN) | Notes field rendering; well-maintained |
| Calendar Logic | Custom JS (no library) | Full control; calendar libs are heavy |
| PWA | `manifest.json` + Service Worker | Installability + offline caching |
| Hosting | **GitHub Pages** or **Netlify** (static) | Zero cost; deploy from `main` branch |

> **No frameworks (React, Vue, etc.) in V1.** The app is intentionally built in vanilla JS to demonstrate that a well-architected vanilla codebase outperforms a poorly architected framework codebase. Framework migration (if ever needed) becomes the V2 decision.

### Directory Structure

```
phd-tracker/
│
├── index.html                    # App shell — single HTML entry point
├── manifest.json                 # PWA manifest
├── service-worker.js             # PWA caching strategy (Cache-First for assets)
├── README.md
│
├── css/                          # ALL styling lives here; NO inline styles in HTML
│   ├── base/
│   │   ├── reset.css             # Modern CSS reset (Josh Comeau's)
│   │   ├── tokens.css            # Design tokens: colors, spacing, radii, shadows, z-indices
│   │   └── typography.css        # Font imports, type scale, text utilities
│   ├── layout/
│   │   ├── shell.css             # App shell: viewport lock, bottom nav, main content area
│   │   └── grid.css              # Reusable grid and flex utility classes
│   ├── components/
│   │   ├── app-card.css          # Application status card
│   │   ├── bottom-nav.css        # Bottom navigation bar
│   │   ├── fab.css               # Floating Action Button
│   │   ├── modal.css             # Slide-up modal / bottom sheet
│   │   ├── calendar.css          # Calendar grid and event dots
│   │   ├── badge.css             # Status chips, countdown badges, conflict warnings
│   │   ├── checklist.css         # Document checklist component
│   │   ├── toast.css             # Toast notification system
│   │   ├── progress.css          # Progress rings and bars
│   │   └── filter-bar.css        # Filter/sort controls
│   ├── screens/
│   │   ├── dashboard.css         # Dashboard screen-specific overrides
│   │   ├── applications.css      # Applications list screen
│   │   ├── calendar.css          # Calendar screen overrides
│   │   └── settings.css          # Settings screen
│   └── themes/
│       ├── light.css             # Light theme overrides
│       └── dark.css              # Dark theme overrides
│
├── js/                           # ALL logic lives here; NO <script> blocks in HTML
│   ├── main.js                   # Entry point: imports router and initializes app
│   ├── router.js                 # Client-side hash router (#/dashboard, #/applications, etc.)
│   │
│   ├── services/                 # Pure logic; no DOM dependencies
│   │   ├── storage.js            # localStorage abstraction: get/set/migrate
│   │   ├── app-service.js        # CRUD operations for applications
│   │   ├── calendar-service.js   # Date computation, conflict detection, event aggregation
│   │   ├── notification.js       # Push notification / in-app alert scheduling
│   │   └── stats-service.js      # Streak, progress, and gamification logic
│   │
│   ├── components/               # Reusable UI components (class-based, return DOM nodes)
│   │   ├── AppCard.js            # Renders a single application card
│   │   ├── BottomNav.js          # Renders and manages bottom navigation state
│   │   ├── CalendarGrid.js       # Renders the interactive calendar
│   │   ├── Fab.js                # FAB component with context-awareness
│   │   ├── Modal.js              # Generic slide-up modal/bottom-sheet
│   │   ├── Toast.js              # Toast notification manager (singleton)
│   │   ├── FilterBar.js          # Filter and sort control bar
│   │   ├── DocumentChecklist.js  # Document checklist with completion tracking
│   │   └── ConfettiEffect.js     # Wrapper around canvas-confetti
│   │
│   ├── screens/                  # Screen controllers — coordinate services + components
│   │   ├── DashboardScreen.js    # Renders dashboard: progress ring, upcoming events
│   │   ├── ApplicationsScreen.js # Renders filtered/sorted application list
│   │   ├── CalendarScreen.js     # Renders calendar + bottom sheet for tapped dates
│   │   ├── DetailScreen.js       # Full detail view for a single application
│   │   └── SettingsScreen.js     # Theme toggle, data export/import, about
│   │
│   └── utils/                    # Stateless helper functions
│       ├── date-utils.js         # Countdown, formatting, conflict checks using Temporal
│       ├── uuid.js               # `crypto.randomUUID()` wrapper with fallback
│       ├── markdown.js           # marked.js wrapper with sanitization
│       └── constants.js          # STATUS_PIPELINE array, colors map, doc types list
│
├── assets/
│   ├── icons/
│   │   ├── app-icon-192.png      # PWA icon
│   │   ├── app-icon-512.png      # PWA icon
│   │   └── favicon.ico
│   └── illustrations/
│       └── empty-state.svg       # SVG illustration for empty dashboard
│
└── data/
    └── universities.json         # Optional: pre-seeded list of top universities for autocomplete
```

---

## UI/UX Architecture

### Core Layout Philosophy: The Viewport Lock

The app's root shell enforces a **100dvh container with no body-level overflow**. All scrolling is contained within individual screen content areas. This gives the app a native feel — the bottom nav and FAB are always anchored, never scrolled off-screen.

```css
/* css/layout/shell.css */
:root {
  --bottom-nav-height: 64px;
  --fab-size: 56px;
}

html, body {
  height: 100%;
  overflow: hidden;           /* CRITICAL: locks the viewport */
}

#app-shell {
  display: grid;
  grid-template-rows: 1fr var(--bottom-nav-height);
  height: 100dvh;
  position: relative;
}

#screen-container {
  overflow-y: auto;           /* Scrolls internally */
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(var(--bottom-nav-height) + var(--fab-size) + 24px);
                              /* Prevents FAB from obscuring last card */
}
```

### Bottom Navigation Bar

The bottom nav has **4 tabs**. No more, no less (cognitive load principle).

| Tab | Icon | Route | Screen |
|-----|------|-------|--------|
| Dashboard | `⬡` (hexagon/home) | `#/dashboard` | Summary stats, upcoming events strip |
| Applications | `📋` (clipboard) | `#/applications` | Scrollable card list with filter bar |
| Calendar | `📅` | `#/calendar` | Month grid + agenda strip |
| Settings | `⚙️` | `#/settings` | Theme, export, about |

**Active state**: The active tab's icon scales up (1.15×), label becomes visible (hidden for inactive tabs), and a pill-shaped indicator slides under it using a CSS `translate` transition — no JS required for the indicator animation.

**Implementation rule**: The `BottomNav.js` component emits a custom `navigate` event on tab tap. The `router.js` listens to this event and orchestrates screen transitions. The bottom nav never directly manipulates screen content.

### Floating Action Buttons (FABs)

| Screen | FAB Action | Icon | Behavior |
|--------|------------|------|----------|
| Dashboard | — | No FAB | Dashboard is read-only |
| Applications | Add New Application | `+` | Opens the Add/Edit modal |
| Calendar | Add New Deadline | `📌` | Opens a date-first quick-add modal |
| Detail (application) | Edit Application | `✏️` | Opens the Edit modal pre-filled |

**FAB Positioning**: Fixed to `bottom: calc(var(--bottom-nav-height) + 16px); right: 20px`. Uses `position: fixed` and a `z-index` pulled from `--z-fab` token (e.g., `100`).

**FAB Animation**: The FAB uses a `scale` + `opacity` enter transition on screen load (`animation: fab-enter 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`). On press, it depresses with `scale(0.92)`.

### Screen Transition Strategy

Screens slide in/out horizontally using CSS `translate` and `opacity` transitions. The router adds/removes CSS classes (`screen--active`, `screen--enter-right`, `screen--exit-left`) on screen wrappers. **No JavaScript animation loops** — all animation is pure CSS driven by class toggling.

```css
/* css/layout/shell.css */
.screen {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(24px);
  transition: opacity 220ms ease, transform 220ms ease;
}

.screen--active {
  opacity: 1;
  pointer-events: all;
  transform: translateX(0);
}
```

### Design Tokens (excerpt from `css/base/tokens.css`)

```css
:root {
  /* Colors */
  --color-bg: #F7F7F2;
  --color-surface: #FFFFFF;
  --color-surface-raised: #F0F0EB;
  --color-primary: #2C3E8C;      /* Deep academic blue */
  --color-accent: #E8A020;       /* Academic gold */
  --color-success: #2D8C4E;
  --color-warning: #E07820;
  --color-danger: #C0392B;
  --color-muted: #8C8C8C;

  /* Status Colors */
  --status-planning: #8C8C8C;
  --status-drafting: #5B8FD4;
  --status-submitted: #2D8C4E;
  --status-under-review: #9B59B6;
  --status-interviewing: #E07820;
  --status-accepted: #E8A020;    /* Gold */
  --status-rejected: #C0392B;

  /* Spacing (8pt grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-card: 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
  --shadow-fab: 0 4px 16px rgba(44,62,140,0.35);
  --shadow-modal: 0 -4px 32px rgba(0,0,0,0.12);

  /* Z-index scale */
  --z-screen: 1;
  --z-sticky: 10;
  --z-fab: 100;
  --z-modal: 200;
  --z-toast: 300;
}
```

### Modal / Bottom Sheet Pattern

All modals (Add Application, Edit, Date Detail, Conflict Warning) use a **slide-up bottom sheet** pattern:

1. A translucent **scrim** fades in over the screen content (`opacity: 0 → 0.5`).
2. The sheet slides up from `translateY(100%) → translateY(0)` with a spring-like cubic-bezier.
3. A drag handle indicator is visible at the top of the sheet.
4. Sheets can be dismissed by tapping the scrim, pressing Escape, or dragging down past a threshold (50% of sheet height).
5. On mobile, the sheet respects `env(safe-area-inset-bottom)` for notched devices.

```css
/* css/components/modal.css */
.modal-sheet {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-6);
  padding-bottom: max(var(--space-6), env(safe-area-inset-bottom));
  box-shadow: var(--shadow-modal);
  transform: translateY(100%);
  transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1);
  z-index: var(--z-modal);
  max-height: 90dvh;
  overflow-y: auto;
}

.modal-sheet--open {
  transform: translateY(0);
}
```

### Calendar UI Spec

- The calendar is a **7-column CSS Grid** (Su Mo Tu We Th Fr Sa headers + date cells).
- Each date cell is a square (aspect-ratio: 1), sized responsively using `fr` units.
- Event dots sit in a flex row below the date number (max 4 dots shown; `+N` overflow label if more).
- Conflict cells: `background: var(--color-warning)` at 15% opacity + amber border + ⚠️ icon in top-right corner of cell.
- Today's date: filled circle behind the date number using `::before` pseudo-element.
- Selected date: same as today but using `--color-primary`.

---

## Phased Implementation Plan

### Phase 0 — Project Scaffolding (Day 1)

**Goal**: Runnable shell with routing and bottom nav. No real features yet.

```
Steps:
1. Create the full directory structure as specified above (all files, empty).
2. Write index.html:
   - Link ALL CSS files in order: reset → tokens → typography → shell → grid → components → screens
   - Create <div id="app-shell"> with bottom-nav placeholder and screen-container
   - Add <script type="module" src="js/main.js"> as the single script tag
3. Implement css/base/tokens.css with all design tokens.
4. Implement css/base/reset.css.
5. Implement css/layout/shell.css with the viewport lock.
6. Implement js/utils/constants.js (STATUS_PIPELINE, STATUS_COLORS).
7. Implement js/services/storage.js (get, set, reset, migrate stubs).
8. Implement js/router.js (hash-based: listen to hashchange, render correct screen).
9. Implement js/components/BottomNav.js (renders 4 tabs, emits navigate events).
10. Implement js/screens/DashboardScreen.js (stub: returns <div>Dashboard</div>).
11. Implement js/main.js (imports all above, instantiates BottomNav, initializes router).
12. Verify: app loads, tabs switch, no scroll on body.
```

### Phase 1 — Data Layer & Application CRUD (Days 2–3)

**Goal**: Full Create/Read/Update/Delete for applications with persistence.

```
Steps:
1. Implement js/utils/uuid.js.
2. Implement js/utils/date-utils.js (countdown, format, isConflict, isPast).
3. Finalize js/services/storage.js (load/save the full AppStore object).
4. Implement js/services/app-service.js:
   - createApplication(fields) → generates id, timestamps, initial statusHistory
   - updateApplication(id, fields) → merges fields, appends statusHistory if status changed
   - deleteApplication(id)
   - getAll() / getById(id)
   - advanceStatus(id) / regressStatus(id)
5. Implement js/components/Modal.js (generic slide-up sheet: open(content), close(), scrim).
6. Implement the Add Application form (rendered inside Modal):
   - Fields: universityName, programName, submissionDeadline (required)
   - Optional: department, country, portalURL, tags
   - Inline validation: deadline must be a future date
   - On submit: call app-service.createApplication(), close modal, show Toast
7. Implement js/components/Toast.js (singleton queue: show(message, type, action)).
8. Implement js/components/AppCard.js:
   - Renders university name, program, status chip, countdown badge, doc completion bar
   - Status stepper (← →) to call advanceStatus/regressStatus
   - Tap → navigate to #/detail/:id
9. Implement js/screens/ApplicationsScreen.js:
   - Calls app-service.getAll()
   - Renders list of AppCard components
   - Empty state with illustration and FAB call-to-action
10. Implement js/components/Fab.js (context-aware: reads current route, shows correct action).
11. Verify: can add, view, update status, and delete applications. Data persists on refresh.
```

### Phase 2 — Detail Screen & Document Checklist (Day 4)

**Goal**: Full detail view with all fields, notes, and document tracking.

```
Steps:
1. Implement js/utils/markdown.js (marked.js wrapper + DOMPurify sanitization — NEVER render unsanitized HTML).
2. Implement js/components/DocumentChecklist.js:
   - Renders each document as a tappable checkbox row
   - Tap toggles completed, calls app-service.updateApplication()
   - Shows completion count "2 / 5 complete" + progress bar
   - Add/remove document items inline
3. Implement js/screens/DetailScreen.js:
   - Reads app id from URL hash (#/detail/uuid)
   - Displays ALL fields with edit-in-place for simple fields
   - Renders DocumentChecklist component
   - Renders notes as sanitized markdown HTML
   - FAB (✏️) opens pre-filled Edit modal
   - Status timeline (horizontal stepper showing statusHistory visually)
4. Implement the Edit Application modal (reuse Add form, pre-populate fields).
5. Implement swipe-to-delete and swipe-to-advance on AppCard (touch events).
6. Implement the Accepted state: confetti burst via ConfettiEffect.js on status → Accepted.
7. Verify: full CRUD cycle, document checklist persists, notes render correctly.
```

### Phase 3 — Calendar View & Conflict Detection (Days 5–6)

**Goal**: Fully interactive calendar with event dots, conflict highlighting, and bottom-sheet detail.

```
Steps:
1. Implement js/services/calendar-service.js:
   - aggregateEvents(applications[]) → returns Map<dateString, Event[]>
     where Event = { type, applicationId, universityName, programName }
   - detectConflicts(eventMap) → returns Set<dateString> of conflict dates
   - getEventsForMonth(year, month, eventMap) → filtered for calendar rendering
2. Implement js/components/CalendarGrid.js:
   - Renders a 7-column CSS grid for a given month
   - Accepts eventMap and conflictDates as props
   - Renders event dots (up to 4 types) per cell
   - Highlights conflict cells with amber background + ⚠️
   - Emits dateSelected event with date string
3. Implement the Upcoming Events strip (horizontal scroll, next 5 events as chips).
4. Implement js/screens/CalendarScreen.js:
   - Instantiates CalendarGrid
   - Handles month navigation (prev/next)
   - On dateSelected: opens bottom sheet with events for that date
   - Conflict bottom sheet: lists all conflicting events, links to detail screens
5. FAB on CalendarScreen: opens a date-first quick-add modal (pick date → pick type → pick application).
6. Verify: all dates with events show correct dots, conflicts highlight correctly, sheet opens on tap.
```

### Phase 4 — Dashboard & Gamification (Day 7)

**Goal**: Meaningful dashboard with stats, streak, and the learning loop reward system.

```
Steps:
1. Implement js/services/stats-service.js:
   - computeStats(applications[], settings) → { total, byStatus, docsCompletion, streak }
   - updateStreak(settings) → increments streakDays if last check-in was yesterday
2. Implement js/components/ConfettiEffect.js (canvas-confetti wrapper).
3. Implement progress ring SVG component (animated stroke-dashoffset).
4. Implement js/screens/DashboardScreen.js (full version):
   - Top: greeting + streak badge ("🔥 3-day streak")
   - Progress ring: Submitted / Total applications
   - Status breakdown: horizontal bar chart using CSS widths
   - Upcoming deadlines strip (next 3 events)
   - Quick-action shortcuts (most recent application's next suggested action)
5. Wire up streak check-in on app open (main.js → stats-service.updateStreak).
6. Wire up confetti trigger in app-service.updateApplication when status → Accepted.
7. Verify: stats update in real-time as applications change, streak increments daily.
```

### Phase 5 — Polish, PWA & Theming (Days 8–9)

**Goal**: Production-ready app with PWA support, dark mode, and micro-interactions.

```
Steps:
1. Implement css/themes/dark.css using @media (prefers-color-scheme: dark) + [data-theme="dark"].
2. Implement SettingsScreen.js (theme toggle, export JSON, import JSON, reset data, about).
3. Implement data export (JSON blob download) and import (file picker → parse → validate → merge).
4. Write manifest.json:
   - name, short_name, description
   - icons (192, 512)
   - display: "standalone"
   - theme_color: "#2C3E8C"
   - background_color: "#F7F7F2"
   - start_url: "/"
5. Write service-worker.js (Cache-First for all static assets, Network-First for data):
   - On install: cache all CSS, JS, HTML, fonts, icons
   - On fetch: serve from cache, fall back to network
   - On activate: purge old caches
6. Register service worker in main.js.
7. Add all micro-interactions:
   - AppCard: spring entrance animation (staggered by index)
   - Status chip: color transition on status change
   - FAB: scale entrance on screen load
   - Bottom nav indicator: sliding pill
   - Countdown badge: pulse animation when ≤7 days
8. Implement FilterBar.js (status filter chips + sort dropdown on ApplicationsScreen).
9. Cross-browser/device QA pass.
10. Verify: Lighthouse score ≥ 90 for Performance, Accessibility, Best Practices, PWA.
```

### Phase 6 — Stretch Goals & V2 Seeds (Post-MVP)

> **Do not implement these in V1. Document them here so V2 architectural decisions don't break V1.**

```
- [ ] Optional backend sync (Supabase real-time) — storage.js already abstracted for this
- [ ] Email/push notification reminders (7 days, 3 days, 1 day before deadline)
- [ ] PDF export of application status report
- [ ] Professor contact tracker (linked to application)
- [ ] AI-powered SOP assistant (integrate Claude API for draft feedback)
- [ ] Multi-device sync via QR code or export link
- [ ] Application analytics (acceptance rate by country, program type, etc.)
- [ ] Collaboration mode (share tracker with advisor or mentor)
```

---

## Critical Implementation Rules for the AI Coding Assistant

> Read these before generating any code. Violating these rules requires explicit justification.

1. **No inline styles.** Every visual property must live in a CSS file. If a value needs to be dynamic (e.g., progress percentage), set it as a CSS custom property on the element: `element.style.setProperty('--progress', '0.6')` and reference `var(--progress)` in CSS.

2. **No `<script>` blocks in HTML.** The only script tag in `index.html` is `<script type="module" src="js/main.js">`.

3. **No direct DOM manipulation outside of component files.** Screen controllers call component methods; they do not query selectors or set innerHTML directly.

4. **Services have zero DOM dependencies.** If a service file imports anything from `js/components/`, it is architecturally incorrect. Services are pure data logic.

5. **All user-generated content must be sanitized before `innerHTML` insertion.** Use DOMPurify or equivalent. This is a security non-negotiable.

6. **Mobile-first CSS.** Base styles target mobile viewports. Desktop enhancements use `@media (min-width: 768px)` progressively.

7. **Touch targets must be ≥ 44×44px.** This is a WCAG 2.5.5 requirement. All interactive elements must meet this minimum.

8. **The `STATUS_PIPELINE` array in `constants.js` is the single source of truth** for status ordering. Never hardcode status strings or ordering elsewhere.

9. **All dates are stored and processed as ISO 8601 strings** (`YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ssZ` for datetimes). Never store `Date` objects.

10. **Every function that modifies application data must call `storage.save()`.** No silent mutations.

---

*End of Master Blueprint — PhD Application Tracker v1.0*
*Generated for use as AI Coding Assistant context document.*
