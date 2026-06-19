"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/features/auth/store/authSlice";
import { authService } from "@/features/auth/services/auth.service";
import { getUserFriendlyError } from "@/lib/errors";
import Button from "@/components/ui/Button";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const redirectPath = searchParams.get("redirect") || "/dedicated-admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const res = await authService.loginAdmin(email, password);

      // Store auth state in local storage (same key so it hydrates)
      const authData = { isAuthenticated: true, role: res.role, user: res.user };
      localStorage.setItem("kamira_auth_admin", JSON.stringify(authData));
      dispatch(loginSuccess(res));

      // Redirect back to dashboard or target
      router.push(redirectPath);
    } catch (err: unknown) {
      setError(getUserFriendlyError(err, "We couldn’t sign you in. Check your details and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-12 max-w-md px-4 sm:my-24">
      <div className="overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_20px_50px_-20px_rgba(74,14,26,0.15)]">
        {/* Title Header */}
        <div className="border-b border-line bg-ink-2 px-6 py-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            KamiraFit Administration
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-paper">
            Admin Portal Sign In
          </h2>
        </div>

        {/* Content Form */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 text-xs text-paper placeholder-paper-muted/55 focus:border-gold focus:outline-none transition-colors"
                placeholder="admin@kamirafit.com"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 text-xs text-paper placeholder-paper-muted/55 focus:border-gold focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? "Verifying..." : "Sign In to Dashboard"}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-[10px] text-paper-muted uppercase tracking-wider">
            Demo Credentials:<br />
            <span className="font-semibold text-paper/80">admin@kamirafit.com</span> / <span className="font-semibold text-paper/80">admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-ink-2 px-4">
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
