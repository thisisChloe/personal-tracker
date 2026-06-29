import { Settings } from "lucide-react";
import { Modal } from "./modal";

type WelcomeModalProps = {
  open: boolean;
  onClose: () => void;
};

/** First-visit intro: explains the board and that the data is just a sample. */
export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  return (
    <Modal open={open} title="Welcome to your board!" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-ink-soft">
          This is your personal space — everything is saved right in this
          browser, nothing is sent anywhere, no login required.
        </p>

        <p className="rounded-[var(--radius-inner)] bg-surface-sunken p-3.5 text-sm leading-relaxed text-ink-soft">
          The board is loaded with <strong className="text-ink">sample data</strong>. Open{" "}
          <span className="inline-flex items-center gap-1 font-medium text-ink">
            <Settings size={13} /> Settings
          </span>{" "}
          → <strong className="text-ink">Clear data</strong> to start with a
          blank board of your own.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-btn py-2.5 text-sm font-semibold text-btn-ink transition-colors hover:opacity-90"
        >
          Start exploring
        </button>
      </div>
    </Modal>
  );
}
