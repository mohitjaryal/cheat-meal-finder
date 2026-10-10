import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import AuthDiscoveryAtlas from "@/components/auth/AuthDiscoveryAtlas";
import AuthMotionBackground from "@/components/auth/AuthMotionBackground";
import ReducedMotionVideo from "@/components/auth/ReducedMotionVideo";
import InteractiveTiltCard from "@/components/motion/InteractiveTiltCard";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream lg:min-h-dvh">
      {/* =========================================================
          ORIGINAL STREET FRESH DISCOVERY ATLAS V5.3
      ========================================================== */}
      <div
        className="auth-procedural-background pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div className="auth-procedural-texture" />
        <div className="auth-procedural-aurora" />

        <div className="auth-procedural-orb auth-procedural-orb--mustard" />
        <div className="auth-procedural-orb auth-procedural-orb--terracotta" />
        <div className="auth-procedural-orb auth-procedural-orb--olive" />

        <div className="auth-procedural-line auth-procedural-line--left" />
        <div className="auth-procedural-line auth-procedural-line--right" />

        <AuthDiscoveryAtlas variant="signup" />

        <div className="auth-grain absolute inset-0" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_48%,rgba(247,242,231,0.10),transparent_55%)]" />
      </div>

      {/* Real Three.js/R3F V3.2 */}
      <AuthMotionBackground />

      {/* =========================================================
          PAGE CONTAINER
      ========================================================== */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:min-h-dvh lg:px-8 lg:py-3 xl:px-10">
        {/* Navbar */}
        <header className="street-motion-nav relative z-50 flex min-h-14 shrink-0 items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex min-w-0 shrink items-center gap-3 text-espresso"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-espresso/10 bg-cream shadow-[0_8px_22px_rgba(44,26,20,0.14)] sm:h-[54px] sm:w-[54px]">
              <Image
                src="/images/cheat-meal-logo-candidate.png"
                alt=""
                fill
                aria-hidden="true"
                sizes="54px"
                className="object-cover object-center"
              />
            </span>

            <span className="truncate font-display text-base font-extrabold tracking-[-0.04em] sm:text-lg">
              Cheat Meal Finder
            </span>
          </Link>

          <Link
            href="/"
            className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-espresso transition hover:bg-white/45 sm:inline-flex"
          >
            <span aria-hidden="true">&larr;</span>
            Back to Discover
          </Link>

          <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
            <span className="hidden whitespace-nowrap text-[13px] font-semibold text-[#66564D] md:inline">
              Already a member ?
            </span>

            <Link
              href="/login"
              className="rounded-full border border-espresso/15 bg-cream/95 px-4 py-2 font-bold text-espresso shadow-sm transition hover:border-terracotta/35 hover:bg-surface hover:text-terracotta"
            >
              Log In
            </Link>
          </div>
        </header>

        {/* =========================================================
            SIGNUP EXPERIENCE — PREMIUM V5.3
        ========================================================== */}
        <section className="relative mt-7 grid flex-1 items-stretch gap-10 sm:mt-8 sm:gap-12 lg:mt-2 lg:min-h-0 lg:grid-cols-[0.88fr_1.12fr] lg:gap-6 xl:gap-8">
          {/* Premium Signup Form */}
          <InteractiveTiltCard
            intensity={1.2}
            lift={3}
            className="relative z-30 flex min-h-0 items-center py-4 sm:py-5 lg:py-1"
          >
            <div className="relative w-full">
              <div className="street-premium-glass relative z-20 w-full overflow-hidden rounded-[30px] px-5 py-7 backdrop-saturate-150 sm:px-7 sm:py-8 lg:px-7 lg:py-5 xl:px-9 xl:py-7">
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent" />

                <div className="pointer-events-none absolute -left-28 -top-28 h-64 w-64 rounded-full bg-white/18 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-mustard/8 blur-3xl" />

                <div className="relative z-10">{children}</div>
              </div>

              {/* Pizza */}
              <div className="pointer-events-none absolute -right-2 top-0 z-30 w-[88px] -translate-y-[42%] rotate-[7deg] sm:-right-3 sm:w-[105px] lg:w-[110px] lg:-translate-y-[52%] xl:-right-5 xl:w-[145px]">
                <Image
                  src="/images/auth/auth-pizza-secondary.png"
                  alt=""
                  width={1024}
                  height={1024}
                  aria-hidden="true"
                  sizes="(max-width: 640px) 88px, (max-width: 1024px) 105px, 145px"
                  className="auth-float-a h-auto w-full object-contain drop-shadow-[0_14px_20px_rgba(44,26,20,0.18)]"
                />
              </div>

              {/* Momos */}
              <div className="pointer-events-none absolute -bottom-1 -left-2 z-30 w-[92px] translate-y-[42%] rotate-[-7deg] sm:-left-3 sm:w-[110px] lg:-bottom-2 lg:-left-5 lg:w-[115px] xl:-left-7 xl:w-[150px]">
                <Image
                  src="/images/auth/auth-momos-hero.png"
                  alt=""
                  width={1024}
                  height={1024}
                  aria-hidden="true"
                  sizes="(max-width: 640px) 92px, (max-width: 1024px) 110px, 150px"
                  className="auth-float-b h-auto w-full object-contain drop-shadow-[0_16px_22px_rgba(44,26,20,0.18)]"
                />
              </div>
            </div>
          </InteractiveTiltCard>

          {/* Premium Cinematic Hero */}
          <InteractiveTiltCard
            intensity={3}
            lift={5}
            className="relative z-20 min-h-[430px] overflow-visible sm:min-h-[520px] lg:min-h-0"
          >
            <div className="street-cinematic-frame absolute inset-0 overflow-hidden rounded-[30px] bg-espresso sm:rounded-[32px]">
              {/* Reduced Motion Accessible Hero Video */}
              <ReducedMotionVideo
                src="/videos/auth/signup-street-food.mp4"
                poster="/images/auth/auth-street-meal.png"
                aria-hidden="true"
                className="auth-hero-video absolute inset-0 h-full w-full object-cover object-center"
              />

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(44,26,20,0.06)_0%,rgba(44,26,20,0.01)_40%,rgba(44,26,20,0.44)_100%)]" />

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(221,161,94,0.14),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(196,90,52,0.16),transparent_35%)]" />

              {/* Premium Hero Story */}
              <div className="absolute bottom-4 left-4 right-4 z-20 sm:bottom-7 sm:left-7 sm:right-7 lg:bottom-5 lg:left-6">
                <div className="street-motion-story street-premium-story max-w-[380px] rounded-[22px] px-4 py-4 text-cream sm:px-6 sm:py-5">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-mustard sm:text-xs">
                    Real dishes. Real reviews.
                  </p>

                  <p className="mt-2 font-display text-[1.65rem] font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-3xl">
                    Your next craving starts here.
                  </p>
                </div>
              </div>
            </div>

            {/* Waffle — aligned to hero top-right */}
            <div className="pointer-events-none absolute right-0 top-0 z-30 w-[105px] translate-x-[20%] -translate-y-[25%] rotate-[7deg] sm:w-[125px] lg:w-[115px] xl:w-[155px]">
              <Image
                src="/images/auth/auth-waffle-dessert.png"
                alt=""
                width={1024}
                height={1024}
                aria-hidden="true"
                sizes="(max-width: 640px) 105px, (max-width: 1024px) 125px, 155px"
                className="auth-float-b h-auto w-full object-contain drop-shadow-[0_16px_24px_rgba(44,26,20,0.22)]"
              />
            </div>

            {/* Burger — aligned to hero bottom-right */}
            <div className="pointer-events-none absolute bottom-0 right-0 z-30 w-[108px] translate-x-[20%] translate-y-[20%] rotate-[-6deg] sm:w-[125px] lg:w-[115px] xl:w-[160px]">
              <Image
                src="/images/auth/auth-burger-secondary.png"
                alt=""
                width={1024}
                height={1024}
                aria-hidden="true"
                sizes="(max-width: 640px) 108px, (max-width: 1024px) 125px, 160px"
                className="auth-float-a h-auto w-full object-contain drop-shadow-[0_18px_26px_rgba(44,26,20,0.23)]"
              />
            </div>
          </InteractiveTiltCard>
        </section>

        {/* Footer */}
        <footer className="street-motion-footer relative z-40 mt-3 flex shrink-0 items-center justify-between gap-4 pb-1 text-xs font-semibold text-[#66564D] lg:mt-2">
          <Link
            href="/"
            className="font-bold text-espresso transition hover:text-terracotta sm:hidden"
          >
            &larr; Back to Discover
          </Link>

          <p className="ml-auto text-xs font-semibold tracking-[0.02em] text-[#5C453A]">
            Cheat Meal Finder
          </p>
        </footer>
      </div>
    </main>
  );
}