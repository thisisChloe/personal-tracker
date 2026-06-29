# Personal Tracker

A personal dashboard in a **Minimalism Bento Grid** style. One screen that brings together your most-used tools: Todo, Notes, Bookmarks, Pomodoro, and Habits — all data stored in `localStorage`, no backend required.

## Getting started

```bash
npm install
npm run dev      # open http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build
```

Stack: **Vite + React 19 + TypeScript + Tailwind CSS v4 + lucide-react**. Font: Be Vietnam Pro.

## Features

| Card | Description |
|------|-------------|
| **Todo** (2×2) | Two views: **Board** (drag-and-drop Kanban with 4 columns: Backlog / Todo / Doing / Done) and **Calendar** (tasks shown by due date). Each task has a Title, Description, Due Date, and Status. |
| **Pomodoro** | Two presets — **Classic** (25/5) and **Deep Work** (50/10) — with a progress ring that auto-switches between focus and break. Plays a chime (Web Audio) and fires a system notification (Notification API) when the session ends. |
| **Notes** | A single plain-text area that auto-saves and shows a word count. |
| **Bookmarks** | Paste a link and the title is fetched automatically (via a CORS proxy, trimmed at separators) along with the favicon. Groups are first-class entities: pick an existing group or create one on the fly. Deleting a group moves its bookmarks to "Ungrouped". |
| **Habits** | Tick off today's completion, see your current streak, and view a 7-day grid. |

## Header & Settings

The page header shows the **board name and today's date** on the left and a **Settings** button on the right. Each browser is its own user (localStorage). The Settings modal lets you customise:

- **Board name** — shown in the header.
- **Theme** — Light / Dark (full dark mode).
- **Primary colour** — 6 choices; changes every accent instantly.
- **Background** — 8 preset photos + Plain.
- **Clear data / Sample data** — clearing keeps your appearance settings; sample data overwrites all tasks, notes, and bookmarks.

The theme uses semantic CSS variables (`--color-surface`, `--color-ink`, `--color-accent`, …) toggled via the `.dark` class. The primary colour only changes `--color-accent`; derived shades are computed with `color-mix`. Settings are applied before first paint (in `main.tsx`) to avoid a theme flash on load.

## Design

- Background photo in `public/` → frosted container (full width, padded) → white rounded cards inside.
- Corner-radius rule: container `2.5rem` wraps cards at `1.75rem` which wrap inner elements at `1rem`.
- Tight, consistent spacing between cards; no shadows, no emoji.
- Every card uses the shared `BentoCard` shell: fixed-height header (icon + title, optional action on the right) + scrollable body.
- **Every clickable element has `cursor: pointer`** — global rule in `src/index.css`; non-button/anchor elements with `onClick` add the `cursor-pointer` class manually.

## Project structure

```
src/
├── app.tsx                      # Bento Grid layout + header + settings
├── components/                  # BentoCard, Modal, header, settings-modal, form controls
├── lib/                         # localStorage, settings, date, url, notify, id, cn
└── features/
    ├── todo/                    # board, calendar, dialog, hook, types
    ├── notes/
    ├── bookmarks/
    ├── pomodoro/
    └── habits/
```

Each file stays under 200 lines, named in kebab-case with a clear purpose.
