import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./app";
import { ConfirmProvider } from "./components/confirm-dialog";
import { TooltipProvider } from "./components/ui/tooltip";
import { applySettings, DEFAULT_SETTINGS, type Settings } from "./lib/settings";

// Apply saved theme/accent/background before first paint to avoid a flash.
try {
  const raw = window.localStorage.getItem("pt.settings");
  applySettings(raw ? (JSON.parse(raw) as Settings) : DEFAULT_SETTINGS);
} catch {
  applySettings(DEFAULT_SETTINGS);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider delayDuration={200} skipDelayDuration={300}>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </TooltipProvider>
  </StrictMode>,
);
