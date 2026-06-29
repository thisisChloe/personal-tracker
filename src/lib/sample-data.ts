import { supabase } from "./supabase";
import { toIsoDate } from "./date";
import { createId } from "./id";
import type { Bookmark } from "../features/bookmarks/use-bookmarks";
import type { Habit } from "../features/habits/use-habits";
import type { TaskStatus } from "../features/todo/task-types";

const DAY_MS = 24 * 60 * 60 * 1000;

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

function buildTasks() {
  const now = Date.now();
  return SAMPLE_TASKS.map(([title, description, dueOffset, status], i) => {
    const due_date = dueOffset === null ? "" : isoInDays(dueOffset);
    const done_at = status === "done" ? now - (8 - i) * DAY_MS : null;
    return {
      id: createId(),
      title,
      description,
      due_date,
      status,
      created_at: now - (SAMPLE_TASKS.length - i) * 1000,
      done_at,
      checklist: [] as never[],
    };
  });
}

function buildBookmarks(): (Bookmark & { group_name: string; created_at: number })[] {
  return SAMPLE_BOOKMARKS.map(([url, title, group], i) => ({
    id: createId(),
    url,
    title,
    group,
    group_name: group,
    createdAt: SAMPLE_BOOKMARKS.length - i,
    created_at: SAMPLE_BOOKMARKS.length - i,
  }));
}

function buildHabits(): Habit[] {
  return [
    { id: createId(), name: "Drink enough water", done: [0, -1, -2, -3].map(isoInDays) },
    { id: createId(), name: "Read for 20 minutes", done: [-1, -2, -4].map(isoInDays) },
    { id: createId(), name: "Exercise", done: [0, -1].map(isoInDays) },
  ];
}

async function clearAllTables(userId: string) {
  await Promise.all([
    supabase.from("todos").delete().eq("user_id", userId),
    supabase.from("notes").delete().eq("user_id", userId),
    supabase.from("bookmarks").delete().eq("user_id", userId),
    supabase.from("bookmark_groups").delete().eq("user_id", userId),
    supabase.from("habits").delete().eq("user_id", userId),
  ]);
}

async function writeData(userId: string) {
  const tasks = buildTasks();
  const bookmarks = buildBookmarks();
  const habits = buildHabits();
  const groups = SAMPLE_GROUPS.map((name, i) => ({ name, sort_order: i }));

  await Promise.all([
    supabase.from("todos").insert(
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        due_date: t.due_date,
        status: t.status,
        created_at: t.created_at,
        done_at: t.done_at,
        checklist: [],
      })),
    ),
    supabase.from("bookmarks").insert(
      bookmarks.map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title,
        group_name: b.group_name,
        created_at: b.created_at,
      })),
    ),
    supabase.from("bookmark_groups").insert(groups),
    supabase.from("habits").insert(
      habits.map((h) => ({ id: h.id, name: h.name, done: h.done })),
    ),
    supabase.from("notes").upsert({ user_id: userId, content: SAMPLE_NOTE }),
  ]);
}

export async function createSampleData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await clearAllTables(user.id);
  await writeData(user.id);
  window.location.reload();
}

export async function clearData() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await clearAllTables(user.id);
  window.location.reload();
}

export async function seedSampleDataIfEmpty() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { count } = await supabase
    .from("todos")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (count === 0) {
    await writeData(user.id);
  }
}

export async function countDoneOlderThan(days: number): Promise<number> {
  const cutoff = Date.now() - days * DAY_MS;
  const { count } = await supabase
    .from("todos")
    .select("id", { count: "exact", head: true })
    .eq("status", "done")
    .not("done_at", "is", null)
    .lt("done_at", cutoff);
  return count ?? 0;
}

export async function purgeDoneOlderThan(days: number) {
  const cutoff = Date.now() - days * DAY_MS;
  await supabase
    .from("todos")
    .delete()
    .eq("status", "done")
    .not("done_at", "is", null)
    .lt("done_at", cutoff);
  window.location.reload();
}
