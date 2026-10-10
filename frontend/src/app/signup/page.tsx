"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import AuthShell from "@/components/auth/AuthShell";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

export default function SignupPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");

  const inputStyles =
    "h-[48px] w-full rounded-xl border border-espresso/15 bg-[rgba(255,250,240,0.90)] px-4 text-sm text-espresso shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_4px_16px_rgba(44,26,20,0.04)] outline-none backdrop-blur-md transition duration-200 placeholder:text-muted/60 hover:border-mustard/60 hover:bg-[rgba(255,250,240,0.96)] focus:border-terracotta focus:bg-[#FFFAF0] focus:ring-4 focus:ring-terracotta/10 sm:h-[50px]";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmissionMessage("");
    setPasswordError("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSubmissionMessage(
      "Account registration is coming soon. Backend integration is currently in progress.",
    );
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordError("");
    setSubmissionMessage("");
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    setPasswordError("");
    setSubmissionMessage("");
  }

  return (
    <AuthShell>
      {/* =========================================================
          SIGNUP INTRO
      ========================================================== */}
      <div className="mb-5">
        <p
          className="street-stagger-reveal mb-3 inline-flex rounded-full border border-white/40 bg-mustard/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-terracotta backdrop-blur-sm"
          style={{ animationDelay: "100ms" }}
        >
          Find your next craving
        </p>

        <h1
          className="street-stagger-reveal max-w-lg font-space-display text-[2.25rem] leading-[0.96] tracking-[-0.055em] text-espresso sm:text-[2.65rem] lg:text-[2.85rem]"
          style={{ animationDelay: "200ms" }}
        >
          Create your account
        </h1>

        <p
          className="street-stagger-reveal mt-2.5 max-w-md text-sm leading-6 text-muted sm:text-base"
          style={{ animationDelay: "300ms" }}
        >
          Start discovering local dishes and real reviews.
        </p>
      </div>

      {/* =========================================================
          SIGNUP FORM — UI ONLY
          FastAPI integration pending.
      ========================================================== */}
      <form
        className="space-y-3.5"
        onSubmit={handleSubmit}
      >
        {/* Full Name */}
        <div
          className="street-stagger-reveal"
          style={{ animationDelay: "400ms" }}
        >
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.06em] text-espresso"
          >
            Full Name
          </label>

          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Aarav Sharma"
            required
            aria-required="true"
            onChange={() => setSubmissionMessage("")}
            className={inputStyles}
          />
        </div>

        {/* Email */}
        <div
          className="street-stagger-reveal"
          style={{ animationDelay: "500ms" }}
        >
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.06em] text-espresso"
          >
            Email Address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
            aria-required="true"
            onChange={() => setSubmissionMessage("")}
            className={inputStyles}
          />
        </div>

        {/* Password fields */}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div
            className="street-stagger-reveal"
            style={{ animationDelay: "600ms" }}
          >
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.06em] text-espresso"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              required
              minLength={8}
              aria-required="true"
              value={password}
              onChange={(event) =>
                handlePasswordChange(event.target.value)
              }
              className={inputStyles}
            />
          </div>

          <div
            className="street-stagger-reveal"
            style={{ animationDelay: "700ms" }}
          >
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.06em] text-espresso"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm password"
              required
              aria-required="true"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? "signup-password-error" : undefined
              }
              value={confirmPassword}
              onChange={(event) =>
                handleConfirmPasswordChange(event.target.value)
              }
              className={inputStyles}
            />
          </div>
        </div>

        {/* Password validation feedback */}
        {passwordError && (
          <p
            id="signup-password-error"
            role="alert"
            className="rounded-xl border border-terracotta/25 bg-terracotta/5 px-4 py-2 text-xs font-semibold text-terracotta"
          >
            {passwordError}
          </p>
        )}

        {/* Primary CTA — entrance and hover animations separated */}
        <div
          className="street-stagger-reveal"
          style={{ animationDelay: "800ms" }}
        >
          <button
            type="submit"
            className="auth-cta mt-1 flex h-[50px] w-full items-center justify-center gap-3 rounded-xl border border-white/20 px-6 text-sm font-extrabold text-white focus-visible:outline-none"
          >
            <span>Create Account</span>

            <span className="street-button-arrow" aria-hidden="true">
              &rarr;
            </span>
          </button>
        </div>

        {/* UI-only submission feedback */}
        {submissionMessage && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-xl border border-terracotta/20 bg-surface/90 px-4 py-3 text-center text-xs leading-5 text-espresso sm:text-sm"
          >
            {submissionMessage}
          </p>
        )}
      </form>

      {/* =========================================================
          GOOGLE + APPLE AUTH
          OAuth backend not implemented.
      ========================================================== */}
      <div
        className="street-stagger-reveal"
        style={{ animationDelay: "900ms" }}
      >
        <SocialAuthButtons mode="signup" />
      </div>

      {/* Login redirect */}
      <p
        className="street-stagger-reveal mt-4 text-center text-sm text-muted"
        style={{ animationDelay: "1000ms" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-extrabold text-terracotta transition hover:text-espresso hover:underline"
        >
          Log In
        </Link>
      </p>
    </AuthShell>
  );
}