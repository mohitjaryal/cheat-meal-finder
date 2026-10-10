import Link from "next/link";

import LoginShell from "@/components/auth/LoginShell";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

export default function LoginPage() {
  const inputStyles =
    "h-[52px] w-full rounded-xl border border-espresso/15 bg-[rgba(255,250,240,0.90)] px-4 text-sm text-espresso shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_4px_16px_rgba(44,26,20,0.04)] outline-none backdrop-blur-md transition duration-200 placeholder:text-muted/60 hover:border-mustard/60 hover:bg-[rgba(255,250,240,0.96)] focus:border-terracotta focus:bg-[#FFFAF0] focus:ring-4 focus:ring-terracotta/10 sm:h-[54px]";

  return (
    <LoginShell>
      <div className="mx-auto w-full max-w-xl">
        {/* =======================================================
            LOGIN INTRO
        ======================================================== */}
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

        {/* =======================================================
            LOGIN FORM
            UI-only: FastAPI integration pending.
        ======================================================== */}
        <form className="mt-7 space-y-4">
          {/* Email */}
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
              className={inputStyles}
            />
          </div>

          {/* Password */}
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

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className={inputStyles}
            />
          </div>

          {/* =====================================================
              LOGIN CTA — STREET FRESH BUTTON MOTION V1

              Parent: Sequential entrance animation.
              Button: Independent hover/press animations.
          ====================================================== */}
          <div
            className="street-stagger-reveal mt-1"
            style={{ animationDelay: "600ms" }}
          >
            <button
              type="button"
              className="auth-cta flex h-[52px] w-full items-center justify-center gap-3 rounded-xl px-5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/25 sm:h-[54px] sm:text-base"
            >
              <span className="relative z-10">Log In</span>

              <span
                aria-hidden="true"
                className="auth-cta-arrow relative z-10"
              >
                &rarr;
              </span>
            </button>
          </div>

          {/* =====================================================
              FORGOT PASSWORD — STREET FRESH PREMIUM MICRO-MOTION

              UI-only: Password recovery API pending.
          ====================================================== */}
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
              <span className="relative z-10">
                Forgot Password?
              </span>

              {/* Animated underline */}
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

        {/* =======================================================
            GOOGLE + APPLE + FACEBOOK AUTH UI
            UI-only: OAuth integration pending.
        ======================================================== */}
        <div
          className="street-stagger-reveal"
          style={{ animationDelay: "700ms" }}
        >
          <SocialAuthButtons mode="login" />
        </div>

        {/* =======================================================
            SIGNUP REDIRECT
        ======================================================== */}
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