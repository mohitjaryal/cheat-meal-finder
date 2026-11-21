"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import LoginShell from "@/components/auth/LoginShell";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const SESSION_TOKEN_KEY = "cmf_access_token";

export default function LoginPage() {
  const router = useRouter();
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submittingRef = useRef(false);

  const inputStyles =
    "h-[52px] w-full rounded-xl border border-espresso/15 bg-[rgba(255,250,240,0.90)] px-4 text-sm text-espresso shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_4px_16px_rgba(44,26,20,0.04)] outline-none backdrop-blur-md transition duration-200 placeholder:text-muted/60 hover:border-mustard/60 hover:bg-[rgba(255,250,240,0.96)] focus:border-terracotta focus:bg-[#FFFAF0] focus:ring-4 focus:ring-terracotta/10 sm:h-[54px]";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    setSubmissionMessage("");

    if (!API_URL) {
      setSubmissionMessage(
        "Login is unavailable because the API URL is not configured.",
      );
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setSubmissionMessage("Please enter your email and password.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      if (response.status === 401) {
        setSubmissionMessage("Invalid email or password. Please try again.");
        return;
      }

      if (!response.ok) {
        setSubmissionMessage(
          "Unable to log in right now. Please try again later.",
        );
        return;
      }

      const data: unknown = await response.json();

      if (
        typeof data !== "object" ||
        data === null ||
        !("access_token" in data) ||
        typeof data.access_token !== "string" ||
        data.access_token.trim() === ""
      ) {
        setSubmissionMessage(
          "The login response was invalid. Please try again later.",
        );
        return;
      }

      try {
        window.sessionStorage.setItem(SESSION_TOKEN_KEY, data.access_token);
      } catch {
        setSubmissionMessage(
          "Your browser could not save this session. Please check your browser settings and try again.",
        );
        return;
      }

      form.reset();
      setShowPassword(false);
      router.replace("/dashboard");
    } catch {
      setSubmissionMessage(
        "Could not connect to the login service. Please check your connection and try again.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <LoginShell>
      <div className="mx-auto w-full max-w-xl">
        <p
          className="street-stagger-reveal inline-flex rounded-full border border-white/40 bg-mustard/15 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-terracotta backdrop-blur-sm sm:text-[11px]"
          style={{ animationDelay: "100ms" }}
        >
          Your cravings remember you
        </p>

        <h1
          className="street-stagger-reveal mt-4 font-display text-[2.5rem] font-extrabold leading-[0.95] tracking-[-0.055em] text-espresso sm:text-[2.85rem] lg:text-[3.05rem]"
          style={{ animationDelay: "200ms" }}
        >
          Welcome back
        </h1>

        <p
          className="street-stagger-reveal mt-3 text-sm leading-6 text-muted sm:text-base"
          style={{ animationDelay: "300ms" }}
        >
          Sign in and get back to discovering dishes worth craving.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div
            className="street-stagger-reveal"
            style={{ animationDelay: "400ms" }}
          >
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.04em] text-espresso"
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

          <div
            className="street-stagger-reveal"
            style={{ animationDelay: "500ms" }}
          >
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.04em] text-espresso"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                aria-required="true"
                onChange={() => setSubmissionMessage("")}
                className={`${inputStyles} pr-12`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-controls="password"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-espresso/65 transition hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                {showPassword ? (
                  <EyeOff size={19} aria-hidden="true" />
                ) : (
                  <Eye size={19} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div
            className="street-stagger-reveal mt-1"
            style={{ animationDelay: "600ms" }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-cta flex h-[52px] w-full items-center justify-center gap-3 rounded-xl px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/25 disabled:cursor-wait disabled:opacity-70 sm:h-[54px] sm:text-base"
            >
              <span className="relative z-10">
                {isSubmitting ? "Logging in..." : "Log In"}
              </span>
              <span
                aria-hidden="true"
                className="auth-cta-arrow relative z-10"
              >
                &rarr;
              </span>
            </button>
          </div>

          {submissionMessage && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-xl border border-terracotta/20 bg-surface/90 px-4 py-3 text-center text-xs leading-5 text-espresso sm:text-sm"
            >
              {submissionMessage}
            </p>
          )}

          {/* Password recovery remains UI-only until an API is available. */}
          <div
            className="street-stagger-reveal flex justify-center pt-1"
            style={{ animationDelay: "650ms" }}
          >
            <span
              title="Password recovery is coming soon"
              className="
                group relative inline-flex cursor-not-allowed
                items-center justify-center
                rounded-full px-4 py-1.5
                text-xs font-medium tracking-[0.01em]
                text-terracotta/85
                transition-all duration-300 ease-out
                hover:bg-terracotta/5
                hover:text-terracotta
                sm:text-sm
              "
            >
              <span className="relative z-10">Forgot Password?</span>
              <span
                aria-hidden="true"
                className="
                  pointer-events-none absolute
                  bottom-1 left-4 right-4
                  h-px origin-center scale-x-0
                  bg-gradient-to-r
                  from-transparent via-terracotta to-transparent
                  opacity-70
                  transition-transform duration-300 ease-out
                  group-hover:scale-x-100
                "
              />
              <span className="sr-only">
                Password recovery is coming soon.
              </span>
            </span>
          </div>
        </form>

        {/* Social authentication remains UI-only. */}
        <div
          className="street-stagger-reveal"
          style={{ animationDelay: "700ms" }}
        >
          <SocialAuthButtons mode="login" />
        </div>

        <div
          className="street-stagger-reveal mt-5 border-t border-espresso/10 pt-5 text-center text-sm text-muted"
          style={{ animationDelay: "800ms" }}
        >
          New to Cheat Meal Finder?{" "}
          <Link
            href="/signup"
            className="font-extrabold text-terracotta transition hover:text-espresso"
          >
            Create Account
          </Link>
        </div>
      </div>
    </LoginShell>
  );
}