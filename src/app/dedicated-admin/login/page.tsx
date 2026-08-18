"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginAdmin } from "@/features/auth/hooks";
import { getUserFriendlyError } from "@/lib/errors";
import Button from "@/components/ui/Button";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginAdmin = useLoginAdmin();

  const redirectPath = searchParams.get("redirect") || "/dedicated-admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields.");
      }

      // Execute Admin Login
      await loginAdmin.mutateAsync({ email, password });

      // Redirect back to dashboard or target
      router.push(redirectPath);
    } catch (err: unknown) {
      setError(getUserFriendlyError(err, "We couldn’t sign you in. Check your details and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6 sm:py-14">
      <div className="overflow-hidden rounded-3xl border border-line bg-ink shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
        {/* Title Header */}
        <div className="border-b border-line bg-ink-2/90 px-6 py-6 text-center sm:px-10 sm:py-7">
          <p className="inline-flex items-center gap-2 text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] sm:tracking-[0.28em] text-gold">
            <span aria-hidden className="h-px w-4 sm:w-5 bg-gold/60" />
            KamiraFit Administration
            <span aria-hidden className="h-px w-4 sm:w-5 bg-gold/60" />
          </p>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-paper sm:text-3xl">
            Admin Portal Sign In
          </h2>
        </div>

        {/* Content Form */}
        <div className="p-6 sm:p-10">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-xs font-medium text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="admin-email"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-paper-muted"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-line bg-ink-2 px-5 py-3.5 text-sm text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none transition-colors"
                placeholder="admin@kamirafit.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-paper-muted"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-ink-2 pl-5 pr-12 py-3.5 text-sm text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-paper-muted transition-colors hover:text-gold focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="py-3.5 text-sm font-semibold tracking-wider uppercase"
              >
                {loading ? "Verifying..." : "Sign In to Dashboard"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-ink-2 px-4 py-12">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20 text-gold text-sm font-semibold uppercase tracking-widest">
          Loading Admin Portal...
        </div>
      }>
        <AdminLoginContent />
      </Suspense>
    </div>
  );
}
