import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { createId } from "../../lib/id";
import { toIsoDate, todayIso } from "../../lib/date";

export type Habit = {
  id: string;
  name: string;
  /** ISO dates (yyyy-mm-dd) on which the habit was completed. */
  done: string[];
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    supabase
      .from("habits")
      .select("*")
      .then(({ data }) => {
        if (data)
          setHabits(
            data.map((row) => ({ id: row.id, name: row.name, done: row.done ?? [] })),
          );
      });
  }, []);

  function addHabit(name: string) {
    const clean = name.trim();
    if (!clean) return;
    const habit: Habit = { id: createId(), name: clean, done: [] };
    setHabits((prev) => [...prev, habit]);
    supabase.from("habits").insert([habit]);
  }

  function removeHabit(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    supabase.from("habits").delete().eq("id", id);
  }

  function toggleToday(id: string) {
    const t = todayIso();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const done = h.done.includes(t)
          ? h.done.filter((d) => d !== t)
          : [...h.done, t];
        supabase.from("habits").update({ done }).eq("id", id);
        return { ...h, done };
      }),
    );
  }

  return { habits, addHabit, removeHabit, toggleToday };
}

function shiftIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** Consecutive completed days ending today (or yesterday if today isn't done). */
export function currentStreak(done: string[]): number {
  const set = new Set(done);
  let offset = set.has(shiftIso(0)) ? 0 : -1;
  let streak = 0;
  while (set.has(shiftIso(offset))) {
    streak++;
    offset--;
  }
  return streak;
}

/** The last 7 days (oldest → newest) with completion + today flags. */
export function last7Days(
  done: string[],
): Array<{ iso: string; done: boolean; isToday: boolean }> {
  const set = new Set(done);
  const today = todayIso();
  return Array.from({ length: 7 }, (_, i) => {
    const iso = shiftIso(i - 6);
    return { iso, done: set.has(iso), isToday: iso === today };
  });
}
