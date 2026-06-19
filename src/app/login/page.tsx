"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/features/auth/store/authSlice";
import { authService } from "@/features/auth/services/auth.service";
import { getUserFriendlyError } from "@/lib/errors";
import PageShell from "@/components/layout/PageShell";
import Button from "@/components/ui/Button";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  const redirectPath = searchParams.get("redirect") || "/";
  
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all required fields.");
      }

      if (mode === "signup") {
        if (!firstName || !lastName) {
          throw new Error("First name and last name are required.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        
        // Execute Signup
        const res = await authService.signupCustomer({
          email,
          password,
          firstName,
          lastName,
        });

        // Store auth state
        const authData = { isAuthenticated: true, role: res.role, user: res.user };
        localStorage.setItem("kamira_auth_customer", JSON.stringify(authData));
        dispatch(loginSuccess(res));
      } else {
        // Execute Login
        const res = await authService.loginCustomer(email, password);

        // Store auth state
        const authData = { isAuthenticated: true, role: res.role, user: res.user };
        localStorage.setItem("kamira_auth_customer", JSON.stringify(authData));
        dispatch(loginSuccess(res));
      }

      // Redirect back
      router.push(redirectPath);
    } catch (err: unknown) {
      setError(getUserFriendlyError(err, "We couldn’t sign you in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-12 max-w-md px-4 sm:my-20">
      <div className="overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_20px_50px_-20px_rgba(74,14,26,0.15)]">
        {/* Toggle Header */}
        <div className="border-b border-line bg-ink-2 p-1">
          <div className="flex rounded-full bg-ink-3 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`flex-1 rounded-full py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                mode === "signin"
                  ? "bg-gold text-ink shadow-[0_4px_12px_rgba(74,14,26,0.25)]"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`flex-1 rounded-full py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                mode === "signup"
                  ? "bg-gold text-ink shadow-[0_4px_12px_rgba(74,14,26,0.25)]"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6 sm:p-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-paper">
              {mode === "signin" ? "Welcome Back" : "Join KamiraFit"}
            </h2>
            <p className="mt-2 text-xs text-paper-muted uppercase tracking-[0.1em]">
              {mode === "signin"
                ? "Sign in to access your orders and settings"
                : "Create an account for faster checkout"}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="firstName"
                    className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none transition-colors"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="lastName"
                    className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </div>
          </form>

          {mode === "signin" && (
            <p className="mt-6 text-center text-[10px] text-paper-muted uppercase tracking-wider">
              Hint: Any email and password will work for customer login demo!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageShell mainClassName="bg-ink-2 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20 text-gold text-sm font-semibold uppercase tracking-widest">
          Loading...
        </div>
      }>
        <LoginContent />
      </Suspense>
    </PageShell>
  );
}
