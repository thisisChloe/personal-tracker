import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { createId } from "../../lib/id";
import { TASK_STATUSES, type Task, type TaskStatus } from "./task-types";

export type TaskDraft = Pick<
  Task,
  "title" | "description" | "dueDate" | "status" | "checklist"
>;

const DAY_MS = 24 * 60 * 60 * 1000;

export function isArchivedDone(t: Task, days: number): boolean {
  if (days <= 0) return false;
  return (
    t.status === "done" && t.doneAt != null && Date.now() - t.doneAt > days * DAY_MS
  );
}

function stampDone(tasks: Task[]): Task[] {
  const now = Date.now();
  return tasks.map((t) => {
    if (t.status === "done") return t.doneAt != null ? t : { ...t, doneAt: now };
    return t.doneAt != null ? { ...t, doneAt: undefined } : t;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    status: row.status as TaskStatus,
    createdAt: row.created_at,
    doneAt: row.done_at ?? undefined,
    checklist: row.checklist ?? [],
  };
}

function taskToRow(t: Task) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    due_date: t.dueDate,
    status: t.status,
    created_at: t.createdAt,
    done_at: t.doneAt ?? null,
    checklist: t.checklist ?? [],
  };
}

export function useTodos() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTasks(stampDone(data.map(rowToTask)));
      });
  }, []);

  const byStatus = useMemo(() => {
    const groups = Object.fromEntries(
      TASK_STATUSES.map((s) => [s, [] as Task[]]),
    ) as Record<TaskStatus, Task[]>;
    for (const task of tasks) groups[task.status].push(task);
    return groups;
  }, [tasks]);

  function addTask(draft: TaskDraft) {
    const raw: Task = { ...draft, id: createId(), createdAt: Date.now() };
    const [stamped] = stampDone([raw]);
    setTasks((prev) => [stamped, ...prev]);
    supabase.from("todos").insert([taskToRow(stamped)]);
  }

  function updateTask(id: string, draft: TaskDraft) {
    setTasks((prev) =>
      stampDone(prev.map((t) => (t.id === id ? { ...t, ...draft } : t))),
    );
    const base = tasks.find((t) => t.id === id);
    if (base) {
      const [next] = stampDone([{ ...base, ...draft }]);
      supabase.from("todos").update(taskToRow(next)).eq("id", id);
    }
  }

  function patchTask(id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) {
    setTasks((prev) =>
      stampDone(prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    );
    const base = tasks.find((t) => t.id === id);
    if (base) {
      const [next] = stampDone([{ ...base, ...patch }]);
      supabase.from("todos").update(taskToRow(next)).eq("id", id);
    }
  }

  function moveTask(id: string, status: TaskStatus) {
    patchTask(id, { status });
  }

  function reorderTasks(next: Task[]) {
    const stamped = stampDone(next);
    setTasks(stamped);
    supabase.from("todos").upsert(stamped.map(taskToRow));
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    supabase.from("todos").delete().eq("id", id);
  }

  return {
    tasks,
    byStatus,
    addTask,
    updateTask,
    patchTask,
    moveTask,
    reorderTasks,
    removeTask,
  };
}
