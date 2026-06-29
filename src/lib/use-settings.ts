import { useEffect, useMemo } from "react";
import { useLocalStorage } from "./use-local-storage";
import { applySettings, DEFAULT_SETTINGS, type Settings } from "./settings";

/** Read/write personalization settings and keep the DOM in sync with them. */
export function useSettings() {
  const [stored, setSettings] = useLocalStorage<Settings>(
    "pt.settings",
    DEFAULT_SETTINGS,
  );
  // Merge defaults so settings saved before a new field existed still resolve.
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...stored }), [stored]);

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  function update(patch: Partial<Settings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  return { settings, update };
}
