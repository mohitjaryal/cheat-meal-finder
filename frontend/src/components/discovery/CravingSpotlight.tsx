"use client";

import Link from "next/link";
import { ImageOff, RefreshCw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const AUTO_ROTATE_MS = 4500;
const MANUAL_PAUSE_MS = 9000;
const MAX_SPOTLIGHT_DISHES = 4;

type SpotlightDish = {
  id: number;
  name: string;
  description: string | null;
  spiceLevel: string | null;
  imageUrl: string | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; dishes: SpotlightDish[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

/*
 * Accept root-relative paths and HTTPS image URLs only.
 * Invalid or absent URLs render the neutral placeholder.
 */
function safeImageUrl(value: unknown): string | null {
  const text = optionalText(value);
  if (!text) return null;

  if (
    text.startsWith("/") &&
    !text.startsWith("//") &&
    !text.includes("\\")
  ) {
    return text;
  }

  try {
    const url = new URL(text);
    if (
      url.protocol === "https:" &&
      !url.username &&
      !url.password
    ) {
      return url.href;
    }
  } catch {
    // Invalid URL: show the placeholder instead.
  }

  return null;
}

function parseDish(value: unknown): SpotlightDish | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.dish_id !== "number" ||
    !Number.isSafeInteger(value.dish_id) ||
    value.dish_id <= 0 ||
    typeof value.name !== "string" ||
    value.name.trim() === ""
  ) {
    return null;
  }

  return {
    id: value.dish_id,
    name: value.name.trim(),
    description: optionalText(value.description),
    spiceLevel: optionalText(value.spice_level),
    imageUrl: safeImageUrl(value.image_url),
  };
}

function DishImage({ dish }: { dish: SpotlightDish }) {
  const [backendFailed, setBackendFailed] = useState(false);
  const [localFailed, setLocalFailed] = useState(false);

  const representativeImages: Record<string, string> = {
    "spicy chicken burger": "/images/discovery/cheesy-burger.png",
    "classic cheeseburger": "/images/auth/auth-burger-secondary.png",
    "margherita pizza": "/images/discovery/compass/masala-cheese-pizza.png",
  };
  const localImage = representativeImages[dish.name.trim().toLowerCase()] ?? null;

  const usingBackend = Boolean(dish.imageUrl && !backendFailed);
  const imageSrc = usingBackend
    ? dish.imageUrl
    : localFailed
      ? null
      : localImage;

  if (!imageSrc) {
    return (
      <div className="relative z-10 flex h-48 w-48 flex-col items-center justify-center gap-3 rounded-[2rem] border border-[#234332]/20 bg-white/25 text-center text-[#234332]/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-sm sm:h-64 sm:w-64">
        <ImageOff aria-hidden="true" size={34} strokeWidth={1.4} />
        <span className="px-4 text-xs font-semibold">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={usingBackend ? dish.name : `Representative image of ${dish.name}`}
        onError={() => {
          if (usingBackend) {
            setBackendFailed(true);
          } else {
            setLocalFailed(true);
          }
        }}
        referrerPolicy="no-referrer"
        className="min-h-0 max-h-[440px] w-full flex-1 object-contain drop-shadow-[0_25px_25px_rgba(23,51,35,0.32)] motion-safe:animate-[craving-food-breathe_5200ms_ease-in-out_infinite]"
      />
      {!usingBackend && (
        <span className="mt-2 text-center text-[10px] font-semibold text-[#234332]/80">
          Representative image
        </span>
      )}
    </div>
  );
}
export default function CravingSpotlight() {
  const [state, setState] = useState<LoadState>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [manualPauseUntil, setManualPauseUntil] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDishes() {
      if (!API_URL) {
        setState({
          status: "error",
          message: "The dish service is not configured.",
        });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/dishes/`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Dish request failed");
        }

        const data: unknown = await response.json();

        if (controller.signal.aborted) return;

        if (!Array.isArray(data)) {
          setState({
            status: "error",
            message: "The dish service returned an unexpected response.",
          });
          return;
        }

        const parsed = data.map(parseDish);

        if (parsed.some((dish) => dish === null)) {
          setState({
            status: "error",
            message: "The dish service returned an unexpected response.",
          });
          return;
        }

        const uniqueDishes = new Map<number, SpotlightDish>();

        for (const dish of parsed) {
          if (dish) uniqueDishes.set(dish.id, dish);
        }

        const dishes = Array.from(uniqueDishes.values())
          .sort((a, b) => a.id - b.id)
          .slice(0, MAX_SPOTLIGHT_DISHES);

        if (dishes.length === 0) {
          setState({ status: "empty" });
          return;
        }

        setActiveIndex(0);
        setState({ status: "ready", dishes });
      } catch {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          message: "Could not load dishes. Please try again.",
        });
      }
    }

    void loadDishes();

    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const update = () => setReducedMotion(query.matches);
    update();

    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setIsPageVisible(!document.hidden);
    update();

    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const dishCount = state.status === "ready" ? state.dishes.length : 0;

  useEffect(() => {
    if (
      reducedMotion ||
      !isVisible ||
      !isPageVisible ||
      dishCount < 2
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      if (Date.now() < manualPauseUntil) return;

      setActiveIndex((previous) => (previous + 1) % dishCount);
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(interval);
  }, [
    dishCount,
    isPageVisible,
    isVisible,
    manualPauseUntil,
    reducedMotion,
  ]);

  const selectDish = useCallback((index: number) => {
    setActiveIndex(index);
    setManualPauseUntil(Date.now() + MANUAL_PAUSE_MS);
  }, []);

  function retry() {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  const activeDish =
    state.status === "ready"
      ? state.dishes[activeIndex]
      : null;

  return (
    <section
      ref={sectionRef}
      id="featured-dishes"
      aria-labelledby="spotlight-heading"
      className="relative isolate w-full min-w-0 overflow-hidden px-5 py-16 text-[#173323] sm:px-10 sm:py-20 lg:px-16 lg:py-24"
    >
      {/* Existing emerald stage treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#8EAA96]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#DCE9DA_0%,#A8C1AC_20%,#739883_45%,#BCD3BC_72%,#9BB9A1_100%)]" />
        <div className="craving-liquid-light absolute -inset-[35%] bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.28)_42%,rgba(232,250,233,0.40)_50%,rgba(255,255,255,0.18)_58%,transparent_75%)] opacity-70 motion-reduce:animate-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_53%_58%,rgba(232,116,65,0.24)_0%,transparent_61%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(24,55,35,0.17)_0.5px,transparent_0.9px)] bg-[length:17px_17px] opacity-[0.12]" />
        <div className="absolute left-[-12%] top-[8%] h-[420px] w-[52%] bg-[#F1FFF0]/25 blur-[115px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[460px] w-[48%] bg-[#E6F4E5]/28 blur-[120px]" />
      </div>

      <div
        className={`relative z-10 mx-auto w-full max-w-[1500px] min-w-0 motion-safe:transition-[opacity,transform] motion-safe:duration-1000 motion-safe:ease-out ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "motion-safe:opacity-0 motion-safe:translate-y-8"
        }`}
      >
        <div className="mb-8 flex flex-col justify-between gap-6 sm:mb-12 lg:mb-14 lg:flex-row lg:items-end">
          <div className="min-w-0 max-w-4xl">
            <div className="mb-4 flex items-center gap-4 sm:mb-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-[#234332] sm:text-xs sm:tracking-[0.32em]">
                The Craving Stage
              </p>
              <span
                aria-hidden="true"
                className="hidden h-px w-14 bg-[#234332]/40 sm:block"
              />
            </div>

            <h2
              id="spotlight-heading"
              className="font-display text-[clamp(2.3rem,9vw,5.3rem)] font-bold leading-[1.02] tracking-[-0.065em] text-[#173323] sm:leading-[0.98] lg:text-[clamp(2.8rem,6vw,5.3rem)]"
            >
              EVERY CRAVING
              <br />
              <span className="text-[#3C684C]">HAS A STORY.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-6 text-[#234332]/85 sm:mt-6 sm:text-base sm:leading-7">
              Discover dishes currently available from the dish service.
            </p>
          </div>

          {state.status === "ready" && (
            <div className="hidden text-right lg:block">
              <p className="font-display text-5xl font-bold text-[#234332]">
                {String(state.dishes.length).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#234332]/65">
                Dishes on this stage
              </p>
            </div>
          )}
        </div>

        {state.status === "loading" && (
          <div
            role="status"
            className="rounded-[2rem] border border-[#234332]/20 bg-white/25 p-8 text-sm font-semibold text-[#234332]"
          >
            Loading dishes...
          </div>
        )}

        {state.status === "empty" && (
          <div
            role="status"
            className="rounded-[2rem] border border-[#234332]/20 bg-white/25 p-8 text-sm text-[#234332]"
          >
            No dishes are available right now.
          </div>
        )}

        {state.status === "error" && (
          <div
            role="alert"
            className="rounded-[2rem] border border-[#234332]/20 bg-white/25 p-8 text-sm text-[#234332]"
          >
            <p>{state.message}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#234332]/30 bg-white/40 px-5 font-bold transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#234332]"
            >
              <RefreshCw aria-hidden="true" size={16} />
              Try again
            </button>
          </div>
        )}

        {state.status === "ready" && activeDish && (
          <>
            <div className="grid w-full min-w-0 grid-cols-1 items-center gap-7 sm:gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)_minmax(0,0.9fr)] lg:gap-10 xl:gap-14">
              {/* Desktop selector */}
              <div className="hidden min-w-0 lg:block">
                <p className="mb-7 text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#234332]/80">
                  Choose Your Craving
                </p>

                <div className="flex flex-col">
                  {state.dishes.map((dish, index) => {
                    const active = index === activeIndex;

                    return (
                      <button
                        key={dish.id}
                        type="button"
                        aria-label={`Show ${dish.name}`}
                        aria-pressed={active}
                        onClick={() => selectDish(index)}
                        className={`group relative flex w-full items-center gap-4 border-b border-[#234332]/20 py-6 text-left transition-colors focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#234332] ${active
                            ? "text-[#173323]"
                            : "text-[#234332]/65 hover:text-[#173323]"
                          }`}
                      >
                        <span className="font-display text-xs font-bold tracking-[0.15em]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 break-words font-display text-[clamp(1.05rem,1.45vw,1.45rem)] font-bold tracking-[-0.045em]">
                          {dish.name}
                        </span>
                        <span aria-hidden="true" className="text-lg">
                          {active ? "↗" : ""}
                        </span>
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#B94F2A]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-8 text-xs leading-6 text-[#234332]/75">
                  Select a dish to explore its details.
                </p>
              </div>

              {/* Food stage */}
              <div className="relative isolate flex min-h-[290px] w-full min-w-0 items-center justify-center sm:min-h-[440px] lg:min-h-[610px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(232,116,65,0.24)] blur-[65px] sm:h-[90%] sm:blur-[90px]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[12%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-full bg-[#173323]/25 blur-[28px]"
                />

                <div
                  key={activeDish.id}
                  className="relative flex h-[290px] w-full items-center justify-center px-2 sm:h-[440px] sm:px-4 lg:h-[620px] lg:w-[120%] motion-safe:animate-[craving-flavor-story-enter_700ms_ease-out_both]"
                >
                  <DishImage dish={activeDish} />
                </div>

                <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#234332]/75">
                  The Flavor Showcase
                </div>
              </div>

              {/* Mobile selector */}
              <div className="w-full min-w-0 lg:hidden">
                <p className="mb-5 text-center text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#234332]">
                  Explore The Menu
                </p>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                  {state.dishes.map((dish, index) => {
                    const active = index === activeIndex;

                    return (
                      <button
                        key={dish.id}
                        type="button"
                        aria-label={`Show ${dish.name}`}
                        aria-pressed={active}
                        onClick={() => selectDish(index)}
                        className={`min-h-[52px] min-w-0 rounded-full border px-3 py-3 text-center text-xs font-bold leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#234332] ${active
                            ? "border-[#234332] bg-[#234332] text-[#F4F6EF]"
                            : "border-[#234332]/30 bg-white/25 text-[#173323]"
                          }`}
                      >
                        <span className="break-words">{dish.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dish details */}
              <div className="w-full min-w-0 lg:pl-3">
                <div
                  key={activeDish.id}
                  className="motion-safe:animate-[craving-flavor-story-enter_850ms_ease-out_both]"
                >
                  <div className="mb-5 flex items-center gap-3 sm:mb-6">
                    <span className="h-2 w-2 rounded-full bg-[#B94F2A]" />
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#234332]">
                      Dish Spotlight
                    </p>
                  </div>

                  <h3 className="break-words font-display text-[clamp(2rem,8vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.06em] text-[#173323] lg:text-[clamp(2.2rem,3.1vw,3.6rem)]">
                    {activeDish.name}
                  </h3>

                  {activeDish.description && (
                    <p className="mt-5 max-w-md text-sm leading-7 text-[#234332]/85 sm:mt-6">
                      {activeDish.description}
                    </p>
                  )}

                  {activeDish.spiceLevel && (
                    <div className="mt-7 border-l-2 border-[#234332]/30 pl-4 sm:mt-8 sm:pl-5">
                      <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#234332]/65">
                        Spice Level
                      </p>
                      <p className="font-display text-sm font-semibold text-[#173323]">
                        {activeDish.spiceLevel}
                      </p>
                    </div>
                  )}

                  <Link
                    href={`/dishes/${activeDish.id}`}
                    className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#234332]/30 bg-white/30 px-5 text-sm font-bold text-[#173323] transition-colors hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#234332]"
                  >
                    View dish
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>

                <div className="mt-9 flex w-full min-w-0 items-center gap-3 sm:mt-12 sm:gap-4">
                  <span className="shrink-0 font-display text-2xl font-bold text-[#234332] sm:text-3xl">
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>

                  <div
                    aria-hidden="true"
                    className="flex min-w-0 flex-1 gap-1.5 sm:gap-2"
                  >
                    {state.dishes.map((dish, index) => (
                      <div
                        key={dish.id}
                        className={`h-[3px] min-w-0 flex-1 rounded-full transition-colors ${index === activeIndex
                            ? "bg-[#234332]"
                            : "bg-[#234332]/20"
                          }`}
                      />
                    ))}
                  </div>

                  <span className="shrink-0 font-display text-xs font-bold text-[#234332]/55 sm:text-sm">
                    {String(state.dishes.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col justify-between gap-4 border-t border-[#234332]/20 pt-6 text-center sm:mt-16 sm:flex-row sm:text-left">
              <p className="text-xs text-[#234332]/75">
                Showing up to {MAX_SPOTLIGHT_DISHES} dishes returned by the dish service.
              </p>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#234332]">
                Street Fresh Discovery
              </p>
            </div>
          </>
        )}
      </div>
    <style>
        {`
          @keyframes craving-liquid-light {
            0% {
              transform: translate3d(-12%,0,0) rotate(-3deg);
            }

            50% {
              transform: translate3d(10%,0,0) rotate(3deg);
            }

            100% {
              transform: translate3d(-12%,0,0) rotate(-3deg);
            }
          }

          .craving-liquid-light {
            animation:
              craving-liquid-light
              16s ease-in-out infinite;
          }

          @keyframes craving-food-breathe {
            0%, 100% {
              transform:
                translate3d(0,0,0)
                scale(1);
            }

            50% {
              transform:
                translate3d(0,-7px,0)
                scale(1.018);
            }
          }

          .craving-food-breathe {
            animation:
              craving-food-breathe
              5200ms ease-in-out infinite;
          }

          @keyframes craving-steam {
            0% {
              opacity: 0;

              transform:
                translate3d(0,20px,0)
                scale(0.65);
            }

            25% {
              opacity: 0.32;
            }

            70% {
              opacity: 0.20;
            }

            100% {
              opacity: 0;

              transform:
                translate3d(20px,-90px,0)
                scale(1.35);
            }
          }

          .craving-steam {
            animation:
              craving-steam
              5200ms ease-out infinite;
          }

          @keyframes craving-flavor-story-enter {
            from {
              opacity: 0;
              transform: translate3d(0,20px,0);
            }

            to {
              opacity: 1;
              transform: translate3d(0,0,0);
            }
          }

          .craving-flavor-story-enter {
            animation:
              craving-flavor-story-enter
              850ms cubic-bezier(0.22,1,0.36,1)
              both;
          }

          @keyframes craving-story-item-enter {
            from {
              opacity: 0;
              transform: translate3d(0,18px,0);
            }

            to {
              opacity: 1;
              transform: translate3d(0,0,0);
            }
          }

          .craving-story-category {
            animation:
              craving-story-item-enter
              650ms cubic-bezier(0.22,1,0.36,1)
              80ms both;
          }

          .craving-story-title {
            animation:
              craving-story-item-enter
              800ms cubic-bezier(0.22,1,0.36,1)
              150ms both;
          }

          .craving-story-description {
            animation:
              craving-story-item-enter
              850ms cubic-bezier(0.22,1,0.36,1)
              260ms both;
          }

          .craving-story-profile {
            animation:
              craving-story-item-enter
              900ms cubic-bezier(0.22,1,0.36,1)
              350ms both;
          }

          @media (prefers-reduced-motion: reduce) {
            .craving-liquid-light,
            .craving-food-breathe,
            .craving-steam,
            .craving-flavor-story-enter,
            .craving-story-category,
            .craving-story-title,
            .craving-story-description,
            .craving-story-profile {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}
      </style>
    </section>
  );
}