import { toIsoDate } from "./date";
import { createId } from "./id";
import type { Bookmark } from "../features/bookmarks/use-bookmarks";
import type { Habit } from "../features/habits/use-habits";
import type { Task, TaskStatus } from "../features/todo/task-types";

/** Tracker data keys — wiped by "clear", filled by "create sample". */
const DATA_KEYS = {
  todos: "pt.todos",
  note: "pt.note",
  bookmarks: "pt.bookmarks",
  groups: "pt.bookmark-groups",
  habits: "pt.habits",
} as const;

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** Demo tasks: title, description, due-day offset (null = no date), status. */
const SAMPLE_TASKS: [string, string, number | null, TaskStatus][] = [
  ["Plan summer vacation", "Choose a destination, book flights and accommodation for the family.", null, "backlog"],
  ["Annual health check-up", "Schedule a general check-up at the clinic.", 9, "backlog"],
  ["Repaint the living room", "Pick a paint colour, buy supplies, and schedule a weekend to do it.", 12, "backlog"],
  ["Clean out the wardrobe", "Sort through old clothes to donate or sell.", null, "backlog"],
  ["Pay electricity & water bill", "Pay this month's utility bill before the due date.", 2, "todo"],
  ["Buy a birthday gift for mum", "Find something she'd like, wrap it, and write a card.", 4, "todo"],
  ["Weekend grocery run", "Buy food for the whole week from the shopping list.", 1, "todo"],
  ["Change motorbike oil", "Take the bike to the shop for routine maintenance.", 3, "todo"],
  ["Cook dinner for the family", "Menu: sour soup, braised fish, steamed vegetables.", 0, "doing"],
  ["Study English every day", "Complete today's lesson on the app — 30 minutes.", 2, "doing"],
  ["Return library books", "Books are due — drop them off to avoid a fine.", -1, "doing"],
  ["Call the grandparents", "Ring them on the weekend to catch up.", -1, "done"],
  ["Take the kids to swimming class", "Saturday afternoon session at the local pool.", -3, "done"],
  ["Pay credit card bill", "Clear the full balance before the statement date.", -5, "done"],
  ["Deep clean the house", "Mop floors, wash curtains, tidy the balcony.", -8, "done"],
];

/** Demo bookmarks: url, title, group. */
const SAMPLE_BOOKMARKS: [string, string, string][] = [
  ["https://mail.google.com", "Gmail", "Daily"],
  ["https://www.google.com/maps", "Google Maps", "Daily"],
  ["https://calendar.google.com", "Google Calendar", "Daily"],
  ["https://news.ycombinator.com", "Hacker News", "News"],
  ["https://www.bbc.com/news", "BBC News", "News"],
  ["https://www.theguardian.com", "The Guardian", "News"],
  ["https://www.amazon.com", "Amazon", "Shopping"],
  ["https://www.ebay.com", "eBay", "Shopping"],
  ["https://www.etsy.com", "Etsy", "Shopping"],
  ["https://www.allrecipes.com", "Allrecipes", "Cooking"],
  ["https://www.ikea.com", "IKEA", "Shopping"],
  ["https://www.facebook.com", "Facebook", ""],
  ["https://www.youtube.com", "YouTube", "Entertainment"],
  ["https://www.netflix.com", "Netflix", "Entertainment"],
];

const SAMPLE_GROUPS = ["Daily", "News", "Shopping", "Cooking", "Entertainment"];

const SAMPLE_NOTE = `This week's to-dos
- Grocery run for the week
- Book a haircut appointment this weekend
- Remind the kids to do their homework

Things to remember
- Mum's birthday on the 20th — order a cake
- Pay school fees at the start of the month
- Take the car in for a service`;

function buildTasks(): Task[] {
  const now = Date.now();
  return SAMPLE_TASKS.map(([title, description, dueOffset, status], i) => ({
    id: createId(),
    title,
    description,
    dueDate: dueOffset === null ? "" : isoInDays(dueOffset),
    status,
    createdAt: now - (SAMPLE_TASKS.length - i) * 1000,
  }));
}

function buildBookmarks(): Bookmark[] {
  return SAMPLE_BOOKMARKS.map(([url, title, group], i) => ({
    id: createId(),
    url,
    title,
    group,
    createdAt: SAMPLE_BOOKMARKS.length - i,
  }));
}

function buildHabits(): Habit[] {
  return [
    { id: createId(), name: "Drink enough water", done: [0, -1, -2, -3].map(isoInDays) },
    { id: createId(), name: "Read for 20 minutes", done: [-1, -2, -4].map(isoInDays) },
    { id: createId(), name: "Exercise", done: [0, -1].map(isoInDays) },
  ];
}

/** Write a full demo dataset into storage (no reload). */
export function writeSampleData() {
  const store = window.localStorage;
  store.setItem(DATA_KEYS.todos, JSON.stringify(buildTasks()));
  store.setItem(DATA_KEYS.note, JSON.stringify(SAMPLE_NOTE));
  store.setItem(DATA_KEYS.bookmarks, JSON.stringify(buildBookmarks()));
  store.setItem(DATA_KEYS.groups, JSON.stringify(SAMPLE_GROUPS));
  store.setItem(DATA_KEYS.habits, JSON.stringify(buildHabits()));
}

/** Seed a demo dataset only if the board has never held tasks. */
export function seedSampleDataIfEmpty() {
  if (window.localStorage.getItem(DATA_KEYS.todos) === null) {
    writeSampleData();
  }
}

/** Overwrite every tracker with a full demo dataset, then reload to render it. */
export function createSampleData() {
  writeSampleData();
  window.location.reload();
}

/** Clear all tracker data and reload, keeping personalization settings. */
export function clearData() {
  for (const key of Object.values(DATA_KEYS)) {
    window.localStorage.removeItem(key);
  }
  window.location.reload();
}

const DAY_MS = 24 * 60 * 60 * 1000;

function readTodos(): Task[] {
  try {
    const raw = window.localStorage.getItem(DATA_KEYS.todos);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

/** How many done tasks were completed more than `days` ago (for the confirm). */
export function countDoneOlderThan(days: number): number {
  const cutoff = Date.now() - days * DAY_MS;
  return readTodos().filter(
    (t) => t.status === "done" && t.doneAt != null && t.doneAt < cutoff,
  ).length;
}

/** Permanently delete done tasks completed more than `days` ago, then reload. */
export function purgeDoneOlderThan(days: number) {
  const cutoff = Date.now() - days * DAY_MS;
  const kept = readTodos().filter(
    (t) => !(t.status === "done" && t.doneAt != null && t.doneAt < cutoff),
  );
  window.localStorage.setItem(DATA_KEYS.todos, JSON.stringify(kept));
  window.location.reload();
}
