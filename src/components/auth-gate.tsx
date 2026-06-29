import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

  // Still checking auth state
  if (session === undefined) return null;

  // Authenticated — render the app
  if (session) return <>{children}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-surface p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink">
          Personal Tracker
        </h1>
        {sent ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Check your inbox for a sign-in link. You can close this tab once
              you&apos;ve clicked it.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-4 text-xs text-ink-faint underline"
            >
              Use a different email
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <p className="text-sm text-ink-soft">
              Enter your email to receive a sign-in link.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-[var(--radius-inner)] bg-surface-muted px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:bg-surface-sunken focus:ring-2 focus:ring-accent/40"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-btn py-2.5 text-sm font-semibold text-btn-ink transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send sign-in link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
