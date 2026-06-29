import { useCallback, useEffect, useRef, useState } from "react";
import { NotebookPen } from "lucide-react";
import { BentoCard } from "../../components/bento-card";
import { supabase } from "../../lib/supabase";

export function NotesCard({ className }: { className?: string }) {
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("notes")
        .select("content")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setText(data.content);
    }
    init();
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      if (!userId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        supabase.from("notes").upsert({ user_id: userId, content: value });
      }, 400);
    },
    [userId],
  );

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <BentoCard
      icon={NotebookPen}
      title="Notes"
      scrollBody={false}
      className={className}
      action={
        <span className="text-xs font-medium text-ink-faint">
          {words} {words === 1 ? "word" : "words"}
        </span>
      }
    >
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Jot something down here, auto-saved..."
        className="h-full w-full resize-none rounded-[var(--radius-inner)] bg-surface-sunken p-3.5 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-faint focus:bg-surface-sunken focus:ring-2 focus:ring-accent/30"
      />
    </BentoCard>
  );
}
