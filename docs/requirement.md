# Personal Tracker — Requirements

Build a Personal Tracker page.

Imagine someone who often forgets their to-dos, sometimes needs to jot something down with nowhere to put it, and has a pile of bookmarks they want to organise by group…

The goal is a single-screen **Minimalism Bento Grid** dashboard that solves all of this. Everything fits in one screen, data is stored in localStorage so no backend is needed, and each browser acts as its own independent user.

---

## I. Design

The project follows a Minimalism Bento Grid style — fill the full screen and let each card adapt its content to its available space.

Each card shares a consistent UI:

1. Large border radius
2. White background
3. Fixed-height header: Icon + Title on the left, optional Action on the far right

All cards use a single shared shell for visual consistency.

**Layout — 3×3 grid:**

- Main content (Todo) is 2×2 in the top-left; other features are 1×1
- Unbuilt features get a title placeholder and "Coming soon" body content (currently: Habits, Spending)
- Features in scope: Todo (Kanban board or Calendar view), Notes (plain text), Bookmarks (grouped), Pomodoro timer

A full-width page header sits at the top: board name + today's date on the left, Settings button on the right.

**UI style:**

- Background photo, then a semi-transparent container with padding, then cards inside
- Large rounded corners and generous spacing — consistent spacing between cards (keep it tight); follow the nested-radius rule (container wraps card wraps inner elements, each slightly smaller)
- Font: Be Vietnam Pro
- No shadows
- No emoji
- Every clickable element must show a pointer cursor
- Stack: Vite + React + TypeScript + Tailwind CSS + Lucide React. Drag-and-drop (Kanban) with dnd-kit; calendar with react-day-picker + date-fns; select / popover Shadcn-style (Radix); animations with Motion (Framer Motion) — add tasteful motion but keep it minimalist
- No extra header titles — the grid is the full UI

**Personalisation (inside Settings):**

- Rename the board (reflected live in the header)
- Light / Dark theme (full dark mode)
- Primary colour: a few quick-pick swatches; changing one updates every accent immediately
- Background: a handful of presets (autumn leaves / green leaves / plain)
- Clear data: removes tasks/notes/bookmarks but keeps appearance settings

Reference image: `/docs/example.webp` — use only as a language reference; anything out of scope can be ignored.

---

## II. Features

### 1. Todo

Add tasks so nothing is forgotten. Each task has: Title, Description, Due Date.

Statuses: Backlog, Todo, Doing, Done.

Two views:
- **Board** — drag-and-drop Kanban across 4 columns
- **Calendar** — tasks displayed by Due Date on a monthly grid

### 2. Notes

Just needs to support freeform text — no rich editor, no categories, no multiple notes.

Auto-saves as you type; shows a word count for fun.

### 3. Bookmarks

Paste a link → auto-fetch the page title and favicon.

Group bookmarks by category and filter by group (groupless bookmarks still work fine).

Groups are first-class entities: create / rename / delete. Deleting a group moves its bookmarks to "Ungrouped".

### 4. Pomodoro

Fixed session presets — 25/5 and 50/10 (or similar sensible values).

Auto-switches between focus and break when time is up; plays a chime + fires a system notification.

### 5. Habits & Spending *(coming soon)*

Placeholder title and "Coming soon" content for now — to be built later.
