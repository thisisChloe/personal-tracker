import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { createId } from "../../lib/id";
import { normalizeUrl, titleFromUrl } from "../../lib/url";

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  /** Empty string means ungrouped. */
  group: string;
  createdAt: number;
};

export type BookmarkDraft = { url: string; title: string; group: string };

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data)
          setBookmarks(
            data.map((row) => ({
              id: row.id,
              url: row.url,
              title: row.title,
              group: row.group_name,
              createdAt: row.created_at,
            })),
          );
      });

    supabase
      .from("bookmark_groups")
      .select("name")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setGroups(data.map((r) => r.name));
      });
  }, []);

  async function addGroup(name: string) {
    const clean = name.trim();
    if (!clean || groups.includes(clean)) return;
    setGroups((prev) => [...prev, clean]);
    await supabase
      .from("bookmark_groups")
      .insert([{ name: clean, sort_order: groups.length }]);
  }

  async function addBookmark(draft: BookmarkDraft) {
    const url = normalizeUrl(draft.url);
    if (!url) return;
    const group = draft.group.trim();
    if (group && !groups.includes(group)) await addGroup(group);
    const bookmark: Bookmark = {
      id: createId(),
      url,
      title: draft.title.trim() || titleFromUrl(url),
      group,
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [bookmark, ...prev]);
    supabase.from("bookmarks").insert([{
      id: bookmark.id,
      url: bookmark.url,
      title: bookmark.title,
      group_name: bookmark.group,
      created_at: bookmark.createdAt,
    }]);
  }

  function removeBookmark(id: string) {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    supabase.from("bookmarks").delete().eq("id", id);
  }

  function removeGroup(name: string) {
    setGroups((prev) => prev.filter((g) => g !== name));
    setBookmarks((prev) =>
      prev.map((b) => (b.group === name ? { ...b, group: "" } : b)),
    );
    supabase.from("bookmark_groups").delete().eq("name", name);
    supabase.from("bookmarks").update({ group_name: "" }).eq("group_name", name);
  }

  function renameGroup(from: string, to: string) {
    const clean = to.trim();
    if (!clean || clean === from || groups.includes(clean)) return;
    setGroups((prev) => prev.map((g) => (g === from ? clean : g)));
    setBookmarks((prev) =>
      prev.map((b) => (b.group === from ? { ...b, group: clean } : b)),
    );
    supabase.from("bookmark_groups").update({ name: clean }).eq("name", from);
    supabase.from("bookmarks").update({ group_name: clean }).eq("group_name", from);
  }

  return {
    bookmarks,
    groups,
    addGroup,
    addBookmark,
    removeBookmark,
    removeGroup,
    renameGroup,
  };
}
