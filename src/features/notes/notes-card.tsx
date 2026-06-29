import { NotebookPen } from "lucide-react";
import { BentoCard } from "../../components/bento-card";
import { useLocalStorage } from "../../lib/use-local-storage";

/** A single free-form scratch note — no editor, no categories, just text. */
export function NotesCard({ className }: { className?: string }) {
  // Free text changes on every keystroke — debounce the write so a large note
  // doesn't re-serialize the whole string each key press.
  const [text, setText] = useLocalStorage("pt.note", "", { debounce: 400 });
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
        onChange={(e) => setText(e.target.value)}
        placeholder="Jot something down here, auto-saved..."
        className="h-full w-full resize-none rounded-[var(--radius-inner)] bg-surface-sunken p-3.5 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-faint focus:bg-surface-sunken focus:ring-2 focus:ring-accent/30"
      />
    </BentoCard>
  );
}
