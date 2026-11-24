"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Flame,
  ImageOff,
  RotateCcw,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const INITIAL_LIMIT = 6;

type Dish = {
  id: number;
  name: string;
  description: string | null;
  spiceLevel: string | null;
  imageUrl: string | null;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; dishes: Dish[] };

const representativeImages: Record<string, string> = {
  "classic cheeseburger": "/images/auth/auth-burger-secondary.png",
  "spicy chicken burger": "/images/discovery/cheesy-burger.png",
  "margherita pizza": "/images/discovery/compass/masala-cheese-pizza.png",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

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
    // An invalid image URL falls back to a local image or placeholder.
  }

  return null;
}

function parseDish(value: unknown): Dish | null {
  if (!isRecord(value)) return null;

  if (
    typeof value.dish_id !== "number" ||
    !Number.isSafeInteger(value.dish_id) ||
    value.dish_id <= 0 ||
    typeof value.name !== "string" ||
    !value.name.trim()
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

function DishImage({ dish }: { dish: Dish }) {
  const [backendFailed, setBackendFailed] = useState(false);
  const [localFailed, setLocalFailed] = useState(false);

  const localImage =
    representativeImages[dish.name.trim().toLowerCase()] ?? null;

  const usingBackend = Boolean(dish.imageUrl && !backendFailed);

  const imageSrc = usingBackend
    ? dish.imageUrl
    : localFailed
      ? null
      : localImage;

  if (!imageSrc) {
    return (
      <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-white/15 bg-white/5 text-center text-white/65">
        <ImageOff aria-hidden="true" size={30} strokeWidth={1.5} />
        <span className="px-3 text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {/* Backend image hosts are not configured in Next Image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={
          usingBackend
            ? dish.name
            : `Representative image of ${dish.name}`
        }
        onError={() => {
          if (usingBackend) {
            setBackendFailed(true);
          } else {
            setLocalFailed(true);
          }
        }}
        referrerPolicy="no-referrer"
        className="compass-food-image relative z-10 h-[235px] w-[90%] object-contain drop-shadow-[0_24px_25px_rgba(0,0,0,0.35)] sm:h-[265px]"
      />

      {!usingBackend && (
        <span className="absolute bottom-4 right-4 z-20 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white">
          Representative image
        </span>
      )}
    </>
  );
}

function FoodCard({ dish, index }: { dish: Dish; index: number }) {
  const cardRef = useRef<HTMLElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    card.style.setProperty("--rotate-x", `${(0.5 - y) * 6}deg`);
    card.style.setProperty("--rotate-y", `${(x - 0.5) * 6}deg`);
    card.style.setProperty("--pointer-x", `${x * 100}%`);
    card.style.setProperty("--pointer-y", `${y * 100}%`);
  };

  const resetPointer = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
    card.style.setProperty("--pointer-x", "50%");
    card.style.setProperty("--pointer-y", "50%");
  };

  // Existing card motion variables from the approved design.
  const cardStyle = {
    "--rotate-x": "0deg",
    "--rotate-y": "0deg",
    "--pointer-x": "50%",
    "--pointer-y": "50%",
  } as CSSProperties;

  return (
    <article
      ref={cardRef}
      style={cardStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      data-compass-reveal
      className="compass-food-card compass-titanium-card group relative isolate flex h-full min-w-0 flex-col overflow-hidden rounded-[1.8rem]"
    >
      <div
        aria-hidden="true"
        className="compass-card-reflection pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
      />

      <div className="compass-titanium-food-stage relative flex h-[255px] items-center justify-center overflow-hidden border-b border-white/10 sm:h-[285px]">
        <div
          aria-hidden="true"
          className="compass-titanium-halo absolute h-[220px] w-[220px] rounded-full sm:h-[245px] sm:w-[245px]"
        />

        <DishImage dish={dish} />

        <span className="absolute bottom-4 left-5 z-20 font-display text-sm font-bold text-white/65">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F0A477]">
          Dish discovery
        </p>

        <h4 className="mt-3 break-words font-display text-xl font-bold leading-tight tracking-[-0.045em] text-[#FFF8EF] sm:text-2xl">
          {dish.name}
        </h4>

        {dish.description && (
          <p className="mt-3 flex-1 text-xs leading-6 text-[#E8E4DC]/80 sm:text-sm">
            {dish.description}
          </p>
        )}

        {dish.spiceLevel && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/15 pt-5">
            <div className="flex items-center gap-2">
              <Flame
                aria-hidden="true"
                size={15}
                className="text-[#F0A477]"
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/65">
                Spice Level
              </span>
            </div>

            <span className="break-words text-right font-display text-sm font-bold text-[#F5C69E]">
              {dish.spiceLevel}
            </span>
          </div>
        )}

        <Link
          href={`/dishes/${dish.id}`}
          className="relative z-30 mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/20 px-4 text-xs font-bold text-[#FFF8EF] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C69E]"
        >
          View dish
          <ArrowUpRight aria-hidden="true" size={15} />
        </Link>
      </div>
    </article>
  );
}

export default function CravingCompass() {
  const sectionRef = useRef<HTMLElement>(null);

  const [state, setState] = useState<LoadState>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);
  const [selectedSpice, setSelectedSpice] = useState<string | null>(
    null,
  );
  const [showAll, setShowAll] = useState(false);

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

        const unique = new Map<number, Dish>();

        for (const dish of parsed) {
          if (dish) unique.set(dish.id, dish);
        }

        const dishes = Array.from(unique.values()).sort(
          (a, b) => a.id - b.id,
        );

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

  const dishes = useMemo(
    () => (state.status === "ready" ? state.dishes : []),
    [state],
  );

  const spiceOptions = useMemo(() => {
    const options = new Map<string, string>();

    for (const dish of dishes) {
      if (!dish.spiceLevel) continue;

      const key = dish.spiceLevel.toLowerCase();

      if (!options.has(key)) {
        options.set(key, dish.spiceLevel);
      }
    }

    return Array.from(options.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );
  }, [dishes]);

  const filteredDishes = useMemo(() => {
    if (!selectedSpice) return dishes;

    return dishes.filter(
      (dish) => dish.spiceLevel?.toLowerCase() === selectedSpice,
    );
  }, [dishes, selectedSpice]);

  const visibleDishes = showAll
    ? filteredDishes
    : filteredDishes.slice(0, INITIAL_LIMIT);

  const selectedLabel =
    spiceOptions.find(([key]) => key === selectedSpice)?.[1] ?? null;

  /*
   * Observe again when async results or visible cards change.
   * Existing CSS supplies fade-up and reduced-motion behavior.
   */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const elements = Array.from(
      section.querySelectorAll<HTMLElement>("[data-compass-reveal]"),
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.dataset.revealState = "visible";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          target.dataset.revealState = "visible";
          observer.unobserve(target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px",
      },
    );

    elements.forEach((element) => {
      if (element.dataset.revealState === "visible") return;

      element.dataset.revealState = "hidden";
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [state, selectedSpice, showAll]);

  function selectSpice(key: string | null) {
    setSelectedSpice(key);
    setShowAll(false);
  }

  function retry() {
    setSelectedSpice(null);
    setShowAll(false);
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return (
    <section
      ref={sectionRef}
      id="craving-compass"
      aria-labelledby="craving-compass-heading"
      className="compass-v3 compass-titanium relative isolate overflow-hidden px-5 py-20 text-[#FFF8EF] sm:px-10 sm:py-24 lg:px-16 lg:py-28"
    >
      {/* Original metallic background and motion classes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="compass-titanium-background absolute inset-0" />
        <div className="compass-titanium-orb compass-titanium-orb-a absolute -left-[15%] top-[5%]" />
        <div className="compass-titanium-orb compass-titanium-orb-b absolute -right-[15%] top-[25%]" />
        <div className="compass-titanium-orb compass-titanium-orb-c absolute bottom-[-15%] left-[20%]" />
        <div className="compass-metallic-light compass-titanium-light absolute -inset-[40%]" />
        <div className="compass-titanium-texture absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5C69E]/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1450px]">
        <div className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
          <div data-compass-reveal className="max-w-4xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="compass-titanium-icon flex h-10 w-10 items-center justify-center rounded-full">
                <Sparkles aria-hidden="true" size={18} />
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-[#F0A477] sm:text-xs">
                The Dish Discovery Lab
              </span>

              <span className="hidden h-px w-14 bg-[#F0A477]/50 sm:block" />
            </div>

            <h2
              id="craving-compass-heading"
              className="font-display text-[clamp(3rem,5.7vw,6.2rem)] font-bold leading-[0.98] tracking-[-0.075em]"
            >
              EXPLORE YOUR
              <br />
              <span className="compass-titanium-heading">
                CRAVINGS.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-[#E8E4DC]/80 sm:text-base">
              Discover dishes from the dish service and explore
              them by their listed spice level.
            </p>
          </div>

          {state.status === "ready" && (
            <div
              data-compass-reveal
              className="compass-titanium-counter flex w-fit items-center gap-5 rounded-[1.5rem] px-7 py-5"
            >
              <span className="font-display text-5xl font-bold tracking-[-0.07em] text-[#F5C69E]">
                {String(dishes.length).padStart(2, "0")}
              </span>

              <div>
                <p className="font-display text-sm font-bold">
                  Dishes returned
                </p>
                <p className="mt-1 text-xs text-[#E8E4DC]/65">
                  Ready to explore
                </p>
              </div>
            </div>
          )}
        </div>

        {state.status === "loading" && (
          <div
            role="status"
            className="compass-titanium-empty rounded-[2rem] px-6 py-12 text-center text-sm"
          >
            Loading dishes...
          </div>
        )}

        {state.status === "error" && (
          <div
            role="alert"
            className="compass-titanium-empty rounded-[2rem] px-6 py-12 text-center"
          >
            <p className="text-sm">{state.message}</p>
            <button
              type="button"
              onClick={retry}
              className="compass-titanium-more mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C69E]"
            >
              <RotateCcw aria-hidden="true" size={15} />
              Try again
            </button>
          </div>
        )}

        {state.status === "ready" && dishes.length === 0 && (
          <div
            role="status"
            className="compass-titanium-empty flex min-h-[280px] flex-col items-center justify-center rounded-[2rem] px-6 py-12 text-center"
          >
            <UtensilsCrossed
              aria-hidden="true"
              size={38}
              strokeWidth={1.5}
              className="text-[#F0A477]"
            />
            <h3 className="mt-5 font-display text-2xl font-bold">
              No dishes available yet.
            </h3>
            <p className="mt-3 text-sm text-[#E8E4DC]/70">
              Check back later to explore dishes.
            </p>
          </div>
        )}

        {state.status === "ready" && dishes.length > 0 && (
          <>
            <div
              data-compass-reveal
              className="compass-glass-panel compass-titanium-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-8 lg:p-10"
            >
              <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <div className="flex items-center gap-3 text-[#F0A477]">
                    <ArrowDownRight aria-hidden="true" size={17} />
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]">
                      01 / Choose Your Spice Level
                    </p>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.045em] sm:text-3xl">
                    What are you feeling?
                  </h3>

                  <p className="mt-3 text-sm text-[#E8E4DC]/70">
                    Filter using spice levels listed by the dish service.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={selectedSpice === null}
                  onClick={() => selectSpice(null)}
                  className="compass-titanium-clear inline-flex min-h-10 w-fit items-center gap-2 rounded-full px-4 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#F5C69E] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw aria-hidden="true" size={14} />
                  Clear filter
                </button>
              </div>

              <div
                role="group"
                aria-label="Filter dishes by spice level"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              >
                <button
                  type="button"
                  aria-pressed={selectedSpice === null}
                  onClick={() => selectSpice(null)}
                  className={`compass-flavor-button compass-titanium-flavor relative flex min-h-[126px] min-w-0 flex-col items-start justify-between overflow-hidden rounded-[1.3rem] p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#F5C69E] sm:p-5 ${
                    selectedSpice === null ? "is-selected" : ""
                  }`}
                >
                  <span className="compass-titanium-flavor-icon relative flex h-11 w-11 items-center justify-center rounded-xl">
                    <UtensilsCrossed
                      aria-hidden="true"
                      size={23}
                      strokeWidth={1.8}
                    />
                  </span>
                  <span className="relative mt-4 block font-display text-sm font-bold text-[#FFF8EF] sm:text-base">
                    All dishes
                  </span>
                  {selectedSpice === null && (
                    <span className="compass-titanium-check absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full">
                      <Check aria-hidden="true" size={13} strokeWidth={3} />
                    </span>
                  )}
                </button>

                {spiceOptions.map(([key, label]) => {
                  const selected = selectedSpice === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectSpice(key)}
                      className={`compass-flavor-button compass-titanium-flavor relative flex min-h-[126px] min-w-0 flex-col items-start justify-between overflow-hidden rounded-[1.3rem] p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#F5C69E] sm:p-5 ${
                        selected ? "is-selected" : ""
                      }`}
                    >
                      <span className="compass-titanium-flavor-icon relative flex h-11 w-11 items-center justify-center rounded-xl">
                        <Flame
                          aria-hidden="true"
                          size={23}
                          strokeWidth={1.8}
                        />
                      </span>

                      <span className="relative mt-4 block break-words font-display text-sm font-bold text-[#FFF8EF] sm:text-base">
                        {label}
                      </span>

                      {selected && (
                        <span className="compass-titanium-check absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full">
                          <Check
                            aria-hidden="true"
                            size={13}
                            strokeWidth={3}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-col justify-between gap-3 border-t border-white/15 pt-5 text-xs text-[#E8E4DC]/65 sm:flex-row">
                <span>
                  Dishes without a listed spice level appear under All dishes.
                </span>
                <span className="flex items-center gap-2 font-bold text-[#F5C69E]">
                  <Sparkles aria-hidden="true" size={14} />
                  Explore the menu
                </span>
              </div>
            </div>

            <div
              data-compass-reveal
              className="mb-8 mt-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end lg:mt-16"
            >
              <div>
                <div className="flex items-center gap-3 text-[#F0A477]">
                  <ArrowDownRight aria-hidden="true" size={17} />
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]">
                    02 / Explore Dishes
                  </p>
                </div>

                <h3 className="mt-4 font-display text-[clamp(2rem,3.8vw,3.5rem)] font-bold tracking-[-0.055em]">
                  Your next bite awaits.
                </h3>

                <p
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="mt-3 text-sm text-[#E8E4DC]/70"
                >
                  {selectedLabel
                    ? `${selectedLabel}: ${filteredDishes.length} dishes found.`
                    : `${filteredDishes.length} dishes available to explore.`}
                </p>
              </div>

              {selectedLabel && (
                <div className="compass-titanium-mix flex items-center gap-3 rounded-[1.2rem] px-5 py-4">
                  <Flame
                    aria-hidden="true"
                    size={19}
                    className="shrink-0 text-[#F0A477]"
                  />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                      Spice filter
                    </p>
                    <p className="mt-1 font-display text-sm font-bold text-[#F5C69E]">
                      {selectedLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {filteredDishes.length === 0 ? (
              <div className="compass-titanium-empty flex min-h-[220px] flex-col items-center justify-center rounded-[2rem] px-6 py-12 text-center">
                <UtensilsCrossed
                  aria-hidden="true"
                  size={38}
                  strokeWidth={1.5}
                  className="text-[#F0A477]"
                />
                <h4 className="mt-5 font-display text-2xl font-bold">
                  No dishes found.
                </h4>
                <p className="mt-3 text-sm text-[#E8E4DC]/70">
                  Try another spice level or clear the filter.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`compass-results-grid grid gap-6 ${
                    visibleDishes.length === 1
                      ? "grid-cols-1"
                      : visibleDishes.length === 2 ||
                          visibleDishes.length === 4
                        ? "sm:grid-cols-2"
                        : "sm:grid-cols-2 xl:grid-cols-3"
                  }`}
                >
                  {visibleDishes.map((dish, index) => (
                    <FoodCard key={dish.id} dish={dish} index={index} />
                  ))}
                </div>

                {filteredDishes.length > INITIAL_LIMIT && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAll((current) => !current)}
                      className="compass-titanium-more group inline-flex min-h-[56px] items-center gap-4 rounded-full px-8 font-display text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C69E]"
                    >
                      {showAll
                        ? "Show Fewer Dishes"
                        : `Explore All ${filteredDishes.length} Dishes`}
                      <ArrowUpRight
                        aria-hidden="true"
                        size={18}
                        className="transition-transform duration-300 motion-safe:group-hover:translate-x-1 motion-safe:group-hover:-translate-y-1"
                      />
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="compass-mobile-footer mt-14 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-xs sm:flex-row">
              <p className="max-w-2xl leading-6 text-[#E8E4DC]/60">
                Dish details and spice levels come from the dish service.
                Some images are representative.
              </p>
              <p className="shrink-0 font-bold uppercase tracking-[0.17em] text-[#F0A477]">
                Street Fresh Discovery
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}