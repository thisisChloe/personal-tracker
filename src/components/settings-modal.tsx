import { Check, Moon, Sparkles, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/cn";
import {
  ARCHIVE_DAY_OPTIONS,
  BACKGROUNDS,
  PRIMARY_COLORS,
  PURGE_DAY_OPTIONS,
  type Settings,
} from "../lib/settings";
import {
  clearData,
  countDoneOlderThan,
  createSampleData,
  purgeDoneOlderThan,
} from "../lib/sample-data";
import { useConfirm } from "./confirm-dialog";
import { FieldLabel, TextField } from "./form-controls";
import { Modal } from "./modal";
import { Tooltip } from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type SettingsModalProps = {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onUpdate: (patch: Partial<Settings>) => void;
};

export function SettingsModal({
  open,
  settings,
  onClose,
  onUpdate,
}: SettingsModalProps) {
  const confirm = useConfirm();
  const [purgeDays, setPurgeDays] = useState(30);

  async function handlePurge() {
    const n = countDoneOlderThan(purgeDays);
    const ok = await confirm(
      n === 0
        ? {
            title: "Nothing to clean up",
            message: `No completed tasks older than ${purgeDays} days.`,
            confirmLabel: "Close",
            cancelLabel: "Close",
          }
        : {
            title: `Delete ${n} completed tasks?`,
            message: `Tasks completed more than ${purgeDays} days ago will be permanently deleted (cannot be recovered). Incomplete tasks are not affected.`,
            confirmLabel: "Delete",
            danger: true,
          },
    );
    if (ok && n > 0) purgeDoneOlderThan(purgeDays);
  }

  async function handleClear() {
    if (
      await confirm({
        title: "Clear all data?",
        message:
          "All tasks, notes, and bookmarks will be deleted. Appearance settings are kept.",
        confirmLabel: "Clear data",
        danger: true,
      })
    ) {
      clearData();
    }
  }

  async function handleSeed() {
    if (
      await confirm({
        title: "Create sample data?",
        message:
          "This will overwrite all existing tasks, notes, and bookmarks with a sample dataset.",
        confirmLabel: "Create sample data",
      })
    ) {
      createSampleData();
    }
  }

  return (
    <Modal open={open} title="Settings" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <FieldLabel>Board name</FieldLabel>
          <TextField
            value={settings.boardTitle}
            placeholder="Your dashboard name"
            onChange={(e) => onUpdate({ boardTitle: e.target.value })}
          />
        </div>

        <div>
          <FieldLabel>Theme</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <ThemeOption
              active={settings.theme === "light"}
              icon={<Sun size={16} />}
              label="Light"
              onClick={() => onUpdate({ theme: "light" })}
            />
            <ThemeOption
              active={settings.theme === "dark"}
              icon={<Moon size={16} />}
              label="Dark"
              onClick={() => onUpdate({ theme: "dark" })}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Primary color</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {PRIMARY_COLORS.map((c) => (
              <Tooltip key={c.value} label={c.name}>
                <button
                  type="button"
                  aria-label={c.name}
                  onClick={() => onUpdate({ primary: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full text-white transition-transform hover:scale-105",
                    settings.primary === c.value &&
                      "ring-2 ring-ink ring-offset-2 ring-offset-[var(--color-surface)]",
                  )}
                >
                  {settings.primary === c.value ? <Check size={16} /> : null}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Background</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUNDS.map((bg) => (
              <Tooltip key={bg.name} label={bg.name}>
                <button
                  type="button"
                  aria-label={bg.name}
                  onClick={() => onUpdate({ background: bg.value })}
                  className={cn(
                    "relative aspect-video overflow-hidden rounded-[var(--radius-inner)] bg-surface-muted ring-2 transition",
                    settings.background === bg.value
                      ? "ring-accent"
                      : "ring-transparent hover:ring-line",
                  )}
                >
                  {bg.value ? (
                    <img
                      src={bg.value}
                      alt={bg.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-[11px] font-medium text-ink-soft">
                      {bg.name}
                    </span>
                  )}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <FieldLabel>Auto-hide tasks completed more than</FieldLabel>
            <Select
              value={String(settings.archiveDays)}
              onValueChange={(v) => onUpdate({ archiveDays: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARCHIVE_DAY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <FieldLabel>Permanently delete tasks completed more than</FieldLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={String(purgeDays)}
                  onValueChange={(v) => setPurgeDays(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURGE_DAY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={handlePurge}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-muted px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center gap-2 rounded-full bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 size={16} />
              Clear all
            </button>
            <button
              type="button"
              onClick={handleSeed}
              className="flex items-center justify-center gap-2 rounded-full bg-surface-muted py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
            >
              <Sparkles size={16} />
              Sample data
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ThemeOption({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors",
        active
          ? "bg-accent-strong text-white"
          : "bg-surface-muted text-ink-soft hover:bg-surface-hover",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
