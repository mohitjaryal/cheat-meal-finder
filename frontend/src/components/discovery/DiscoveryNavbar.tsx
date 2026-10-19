"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function DiscoveryNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSearchOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    searchInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsSearchOpen(false);
        setSearchQuery("");

        requestAnimationFrame(() => {
          searchTriggerRef.current?.focus();
        });

        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements =
        searchDialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");

    requestAnimationFrame(() => {
      searchTriggerRef.current?.focus();
    });
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  return (
    <>
      {/* ============================================================
          STREET FRESH PREMIUM — FLOATING NAVBAR V6

          Sticky positioning will be managed by the homepage.
          Original navbar dimensions are preserved.
      ============================================================ */}

      <header className="relative z-40 w-full px-4 pt-4 sm:px-8 sm:pt-5 lg:px-12 lg:pt-6">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[62px] w-full max-w-[1120px] items-center justify-between rounded-full border border-white/50 bg-[#FFFAF0]/60 px-4 shadow-[0_12px_38px_rgba(44,26,20,0.13)] backdrop-blur-[16px] backdrop-saturate-[145%] sm:h-[66px] sm:px-5 lg:px-7"
        >
          {/* BRAND */}

          <Link
            href="/"
            aria-label="Cheat Meal Finder — Home"
            className="group flex min-w-0 items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
          >
            {/* LOGO */}

            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-espresso/15 bg-cream shadow-[0_3px_10px_rgba(44,26,20,0.12)] sm:h-11 sm:w-11">
              <Image
                src="/images/cheat-meal-logo-candidate.png"
                alt=""
                fill
                sizes="44px"
                loading="eager"
                className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
              />
            </span>

            {/* BRAND TEXT */}

            <span className="flex min-w-0 flex-col leading-none">
              <span className="font-display whitespace-nowrap text-[13px] font-extrabold tracking-[-0.045em] text-espresso sm:text-[15px]">
                CHEAT
                <span className="text-terracotta">MEAL</span>
              </span>

              {/* V6: FOOD FINDER VISIBLE ON MOBILE */}

              <span className="mt-1 block whitespace-nowrap text-[8px] font-extrabold uppercase tracking-[0.12em] text-olive sm:text-[9px] sm:tracking-[0.18em]">
                FOOD FINDER
              </span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden items-center gap-7 lg:flex xl:gap-9">
            <Link
              href="/"
              aria-current="page"
              className="rounded-full text-[13px] font-extrabold text-espresso transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
            >
              Discover
            </Link>

            <a
              href="#explore"
              className="rounded-full text-[13px] font-extrabold text-espresso/85 transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
            >
              Explore Food
            </a>

            <a
              href="#categories"
              className="rounded-full text-[13px] font-extrabold text-espresso/85 transition-colors hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
            >
              Categories
            </a>
          </div>

          {/* RIGHT ACTIONS */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* SEARCH */}

            <button
              ref={searchTriggerRef}
              type="button"
              aria-label="Search food"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
              onClick={openSearch}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-espresso/15 bg-white/30 text-espresso transition-colors hover:bg-white/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta sm:h-11 sm:w-11"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[19px] w-[19px]"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 5 5" />
              </svg>
            </button>

            {/* LOGIN */}

            <Link
              href="/login"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-espresso/10 bg-espresso px-5 text-[13px] font-extrabold text-cream shadow-[0_5px_14px_rgba(44,26,20,0.13)] transition-colors hover:bg-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta sm:h-11 sm:px-6"
            >
              Log in
            </Link>
          </div>
        </nav>
      </header>

      {/* ============================================================
          SEARCH MODAL
      ============================================================ */}

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-espresso/60 px-4 pt-20 pb-8 backdrop-blur-md sm:pt-28"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div
            ref={searchDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="discovery-search-title"
            className="w-full max-w-xl rounded-[2rem] border border-white/65 bg-[#FFFAF0]/95 p-5 shadow-[0_30px_90px_rgba(44,26,20,0.35)] backdrop-blur-xl sm:p-7"
          >
            {/* HEADER */}

            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-terracotta">
                  Street Fresh Discovery
                </p>

                <h2
                  id="discovery-search-title"
                  className="font-display mt-2 text-2xl font-bold tracking-[-0.05em] text-espresso sm:text-3xl"
                >
                  What are you craving?
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close food search"
                onClick={closeSearch}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-espresso/15 bg-white/60 text-xl text-espresso transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta"
              >
                ×
              </button>
            </div>

            {/* SEARCH FIELD */}

            <div>
              <label
                htmlFor="discovery-search-input"
                className="mb-2 block text-xs font-bold text-espresso"
              >
                Search dishes or cravings
              </label>

              <input
                ref={searchInputRef}
                id="discovery-search-input"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Try spicy momos, burgers, desserts..."
                className="h-14 w-full rounded-2xl border border-border bg-white/85 px-5 text-sm font-semibold text-espresso outline-none transition-colors placeholder:text-muted focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              />
            </div>

            {/* UI-ONLY STATUS */}

            <p className="mt-5 text-xs leading-6 text-muted">
              Food search results will be available once discovery
              search integration is ready.
            </p>
          </div>
        </div>
      )}
    </>
  );
}