"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginCustomer, useSignupCustomer } from "@/features/auth/hooks";
import { getUserFriendlyError } from "@/lib/errors";
import PageShell from "@/components/layout/PageShell";
import Button from "@/components/ui/Button";

const COUNTRY_CODES = [
  { code: "+91", label: "+91 (India)" },
  { code: "+1", label: "+1 (USA/Canada)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+966", label: "+966 (Saudi Arabia)" },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginCustomer = useLoginCustomer();
  const signupCustomer = useSignupCustomer();
  
  const redirectPath = searchParams.get("redirect") || "/";
  
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("male");
  
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password criteria helper
  const passwordCriteria = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/`~]/.test(password),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // Validation functions
  const validateField = (name: string, value: string, extra?: { password?: string; mode?: "signin" | "signup" }): string => {
    const currentMode = extra?.mode || mode;
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required.";
        if (value.trim().length < 2) return "First name must be at least 2 characters.";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required.";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Please enter a valid email address.";
        return "";
      case "gender":
        if (!value.trim()) return "Please select a gender.";
        return "";
      case "phoneNumber": {
        const digits = value.replace(/\D/g, "");
        if (!digits) return "Phone number is required.";
        if (digits.length < 7 || digits.length > 15) return "Please enter a valid 7-15 digit phone number.";
        return "";
      }
      case "password":
        if (!value) return "Password is required.";
        if (currentMode === "signup") {
          const meetsAll =
            value.length >= 8 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /\d/.test(value) &&
            /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/`~]/.test(value);
          if (!meetsAll) return "Please fulfill all password requirements below.";
        }
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password.";
        if (value !== (extra?.password ?? password)) return "Passwords do not match.";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = "";
    if (field === "firstName") val = firstName;
    else if (field === "lastName") val = lastName;
    else if (field === "email") val = email;
    else if (field === "gender") val = gender;
    else if (field === "phoneNumber") val = phoneNumber;
    else if (field === "password") val = password;
    else if (field === "confirmPassword") val = confirmPassword;

    const errMsg = validateField(field, val, { password, mode });
    setErrors((prev) => ({ ...prev, [field]: errMsg }));
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === "firstName") setFirstName(value);
    else if (field === "lastName") setLastName(value);
    else if (field === "email") setEmail(value);
    else if (field === "gender") setGender(value);
    else if (field === "phoneNumber") setPhoneNumber(value.replace(/[^\d\s-]/g, ""));
    else if (field === "password") {
      setPassword(value);
      if (touched.confirmPassword || errors.confirmPassword) {
        const confirmErr = validateField("confirmPassword", confirmPassword, { password: value, mode });
        setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
      }
    } else if (field === "confirmPassword") setConfirmPassword(value);

    // If already touched or errored, validate dynamically in real time
    if (touched[field] || errors[field]) {
      const errMsg = validateField(field, value, { password, mode });
      setErrors((prev) => ({ ...prev, [field]: errMsg }));
    }
  };

  const switchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setServerError("");
    setErrors({});
    setTouched({});
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    if (mode === "signup") {
      newTouched.firstName = true;
      newTouched.lastName = true;
      newTouched.email = true;
      newTouched.gender = true;
      newTouched.phoneNumber = true;
      newTouched.password = true;
      newTouched.confirmPassword = true;

      newErrors.firstName = validateField("firstName", firstName, { mode });
      newErrors.lastName = validateField("lastName", lastName, { mode });
      newErrors.email = validateField("email", email, { mode });
      newErrors.gender = validateField("gender", gender, { mode });
      newErrors.phoneNumber = validateField("phoneNumber", phoneNumber, { mode });
      newErrors.password = validateField("password", password, { mode });
      newErrors.confirmPassword = validateField("confirmPassword", confirmPassword, { password, mode });
    } else {
      newTouched.email = true;
      newTouched.password = true;

      newErrors.email = validateField("email", email, { mode });
      newErrors.password = validateField("password", password, { mode });
    }

    setTouched(newTouched);
    setErrors(newErrors);

    return Object.values(newErrors).every((err) => !err);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const isValid = validateAll();
    if (!isValid) return;

    setLoading(true);

    try {
      if (mode === "signup") {
        await signupCustomer.mutateAsync({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          countryCode: countryCode.trim(),
          phoneNumber: phoneNumber.trim(),
          gender: gender.trim(),
        });
      } else {
        await loginCustomer.mutateAsync({
          email: email.trim(),
          password,
        });
      }

      // Redirect back
      router.push(redirectPath);
    } catch (err: unknown) {
      const errMsg = getUserFriendlyError(err, "We couldn’t process your request. Please check your details and try again.");
      setServerError(errMsg);

      // Highlight the relevant field if error specifically mentions email or phone
      const lower = errMsg.toLowerCase();
      if (lower.includes("email")) {
        setTouched((prev) => ({ ...prev, email: true }));
        setErrors((prev) => ({ ...prev, email: errMsg }));
      } else if (lower.includes("phone") || lower.includes("mobile")) {
        setTouched((prev) => ({ ...prev, phoneNumber: true }));
        setErrors((prev) => ({ ...prev, phoneNumber: errMsg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    const hasError = Boolean(touched[fieldName] && errors[fieldName]);
    return `w-full rounded-xl border px-4 py-2.5 text-xs text-paper placeholder-paper-muted/50 transition-colors focus:outline-none ${
      hasError
        ? "border-red-500/90 bg-red-500/5 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
        : "border-line bg-ink-2 focus:border-gold"
    }`;
  };

  return (
    <div className={`mx-auto my-3 sm:my-6 w-full px-4 transition-all duration-300 ${mode === "signup" ? "max-w-2xl" : "max-w-md"}`}>
      <div className="overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_20px_50px_-20px_rgba(74,14,26,0.15)]">
        {/* Toggle Header */}
        <div className="border-b border-line bg-ink-2 p-1">
          <div className="flex rounded-full bg-ink-3 p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 rounded-full py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                mode === "signin"
                  ? "bg-gold text-ink shadow-[0_4px_12px_rgba(74,14,26,0.25)]"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-full py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
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
        <div className="p-4 sm:p-6">
          <div className="text-center">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-paper">
              {mode === "signin" ? "Welcome Back" : "Join KamiraFit"}
            </h2>
            <p className="mt-1 text-[11px] text-paper-muted uppercase tracking-[0.1em]">
              {mode === "signin"
                ? "Sign in to access your orders and settings"
                : "Create an account for faster checkout"}
            </p>
          </div>

          {serverError && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-500">
              {serverError}
            </div>
          )}

          <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === "signup" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label
                      htmlFor="firstName"
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                    >
                      First Name <span className="text-gold">*</span>
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => handleFieldChange("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      className={getInputClass("firstName")}
                      placeholder="John"
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="text-[10px] font-medium text-red-500 mt-0.5">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label
                      htmlFor="lastName"
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                    >
                      Last Name <span className="text-gold">*</span>
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => handleFieldChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      className={getInputClass("lastName")}
                      placeholder="Doe"
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="text-[10px] font-medium text-red-500 mt-0.5">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                    >
                      Email Address <span className="text-gold">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={getInputClass("email")}
                      placeholder="you@example.com"
                    />
                    {touched.email && errors.email && (
                      <p className="text-[10px] font-medium text-red-500 mt-0.5">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label
                      htmlFor="gender"
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                    >
                      Gender <span className="text-gold">*</span>
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => handleFieldChange("gender", e.target.value)}
                      onBlur={() => handleBlur("gender")}
                      className={`cursor-pointer ${getInputClass("gender")}`}
                    >
                      <option value="male" className="bg-ink text-paper">Male</option>
                      <option value="female" className="bg-ink text-paper">Female</option>
                      <option value="other" className="bg-ink text-paper">Other</option>
                    </select>
                    {touched.gender && errors.gender && (
                      <p className="text-[10px] font-medium text-red-500 mt-0.5">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor="phoneNumber"
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                    >
                      Phone Number <span className="text-gold">*</span>
                    </label>
                    <div className="grid grid-cols-12 gap-1.5">
                      <div className="col-span-5 sm:col-span-3">
                        <select
                          id="countryCode"
                          aria-label="Country Code"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full rounded-xl border border-line bg-ink-2 px-2 py-2 text-xs text-paper focus:border-gold focus:outline-none transition-colors cursor-pointer"
                        >
                          {COUNTRY_CODES.map((item) => (
                            <option key={item.code} value={item.code} className="bg-ink text-paper">
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-7 sm:col-span-9">
                        <input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                          onBlur={() => handleBlur("phoneNumber")}
                          className={getInputClass("phoneNumber")}
                          placeholder="98765 43210"
                        />
                      </div>
                    </div>
                    {touched.phoneNumber && errors.phoneNumber && (
                      <p className="text-[10px] font-medium text-red-500 mt-0.5">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                    >
                      Password <span className="text-gold">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      className={getInputClass("password")}
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label
                      htmlFor="confirmPassword"
                      className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                    >
                      Confirm Password <span className="text-gold">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      className={getInputClass("confirmPassword")}
                      placeholder="••••••••"
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-[10px] font-medium text-red-500 mt-0.5">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Requirements Compact 2/3 Column Box */}
                <div className="rounded-xl border border-line bg-ink-2/60 px-3.5 py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-paper-muted mb-1.5">
                    Password Requirements:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 text-[10px] sm:text-[11px]">
                    <li className={`flex items-center gap-1.5 transition-colors duration-200 ${passwordCriteria.hasLength ? "text-emerald-400" : "text-red-500"}`}>
                      <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${passwordCriteria.hasLength ? "bg-emerald-400" : "bg-red-500"}`} />
                      <span>Min 8 characters</span>
                    </li>
                    <li className={`flex items-center gap-1.5 transition-colors duration-200 ${passwordCriteria.hasUpper ? "text-emerald-400" : "text-red-500"}`}>
                      <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${passwordCriteria.hasUpper ? "bg-emerald-400" : "bg-red-500"}`} />
                      <span>1 uppercase (A-Z)</span>
                    </li>
                    <li className={`flex items-center gap-1.5 transition-colors duration-200 ${passwordCriteria.hasLower ? "text-emerald-400" : "text-red-500"}`}>
                      <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${passwordCriteria.hasLower ? "bg-emerald-400" : "bg-red-500"}`} />
                      <span>1 lowercase (a-z)</span>
                    </li>
                    <li className={`flex items-center gap-1.5 transition-colors duration-200 ${passwordCriteria.hasNumber ? "text-emerald-400" : "text-red-500"}`}>
                      <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${passwordCriteria.hasNumber ? "bg-emerald-400" : "bg-red-500"}`} />
                      <span>1 number (0-9)</span>
                    </li>
                    <li className={`flex items-center gap-1.5 transition-colors duration-200 sm:col-span-2 md:col-span-2 ${passwordCriteria.hasSpecial ? "text-emerald-400" : "text-red-500"}`}>
                      <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${passwordCriteria.hasSpecial ? "bg-emerald-400" : "bg-red-500"}`} />
                      <span>1 special character (!@#$%...)</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Sign In Fields */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                  >
                    Email Address <span className="text-gold">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={getInputClass("email")}
                    placeholder="you@example.com"
                  />
                  {touched.email && errors.email && (
                    <p className="text-[10px] font-medium text-red-500 mt-0.5">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-bold uppercase tracking-[0.1em] text-paper-muted"
                  >
                    Password <span className="text-gold">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={getInputClass("password")}
                    placeholder="••••••••"
                  />
                  {touched.password && errors.password && (
                    <p className="text-[10px] font-medium text-red-500 mt-0.5">
                      {errors.password}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="pt-1.5">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="py-2.5 text-xs font-semibold tracking-wider uppercase"
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
            <p className="mt-4 text-center text-[10px] text-paper-muted uppercase tracking-wider">
              Enter your registered email and password to sign in.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageShell mainClassName="bg-ink-2 flex items-center justify-center min-h-[calc(100vh-10rem)] py-2">
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
