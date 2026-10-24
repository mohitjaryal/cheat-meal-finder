"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import Image from "next/image";

import {
  ArrowDownRight,
  ArrowRight,
  Search,
  X,
} from "lucide-react";

import {
  ArrowsDownUp,
  ArrowCounterClockwise,
  CaretDown,
  CheckCircle,
  Compass,
  CookingPot,
  Fire,
  ForkKnife,
  FadersHorizontal,
  MagnifyingGlass,
  PlugsConnected,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";

/* ============================================================
   CHEAT MEAL FINDER
   SEARCH EXPERIENCE — V8

   BLUSH DISCOVERY STUDIO × RUBY CHROME

   HERO:
   Approved V4.5 Velvet Cinema Loop

   DISCOVERY:
   Blush Pearl × Ruby Accents × White Glass
   Phosphor Duotone Iconography
   Horizontal Discovery Filter Studio
   Scroll-Triggered Reveals
   Real Backend Data Only

   STYLING:
   Scoped .search-v8 selectors in globals.css
============================================================ */

type Dish = {
  dish_id: number;
  vendor_id: number;
  category_id: number;
  name: string;
  price: number | string;
  spice_level: number;
  description: string | null;
  image_url: string | null;
};

type LoadState =
  | "loading"
  | "success"
  | "error"
  | "unconfigured";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const HERO_VIDEO =
  "/videos/search/craving-cinema-smooth.mp4";

const CROSSFADE_DURATION = 1.8;

/* ============================================================
   UTILITIES
============================================================ */

function formatPrice(price: number | string) {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function isDish(value: unknown): value is Dish {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.dish_id === "number" &&
    Number.isFinite(item.dish_id) &&
    typeof item.vendor_id === "number" &&
    Number.isFinite(item.vendor_id) &&
    typeof item.category_id === "number" &&
    Number.isFinite(item.category_id) &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    typeof item.spice_level === "number" &&
    Number.isFinite(item.spice_level) &&
    item.spice_level >= 0 &&
    item.spice_level <= 5 &&
    (typeof item.price === "number" ||
      typeof item.price === "string") &&
    Number.isFinite(Number(item.price)) &&
    Number(item.price) >= 0 &&
    (item.description == null ||
      typeof item.description === "string") &&
    (item.image_url == null ||
      typeof item.image_url === "string")
  );
}

/* ============================================================
   SCROLL REVEAL
============================================================ */

function useDiscoveryReveal() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(
        "[data-search-reveal]"
      )
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;

          element.dataset.revealState = "visible";

          observer.unobserve(element);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.92) {
        element.dataset.revealState = "visible";
      } else {
        element.dataset.revealState = "hidden";
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();

      elements.forEach((element) => {
        delete element.dataset.revealState;
      });
    };
  }, []);

  return containerRef;
}

/* ============================================================
   APPROVED V4.5 CINEMA BACKGROUND

   Dual-video crossfade:
   1.8-second velvet dissolve on desktop.

   Mobile:
   Single looping video.

   Reduced motion:
   Static image fallback.
============================================================ */

function CinemaBackground() {
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);

  const activeVideoRef = useRef(0);
  const transitionRef = useRef(false);

  const timeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const reducedMotionRef = useRef(false);
  const mobileRef = useRef(false);

  const [activeVideo, setActiveVideo] = useState(0);

  const [visibleVideos, setVisibleVideos] = useState([
    true,
    false,
  ]);

  const [crossfadeEnabled, setCrossfadeEnabled] =
    useState(false);

  const getVideos = useCallback(() => {
    return [
      firstVideoRef.current,
      secondVideoRef.current,
    ];
  }, []);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const mobileQuery = window.matchMedia(
      "(max-width: 767px)"
    );

    const videos = getVideos();

    const clearTransition = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      transitionRef.current = false;
    };

    const updatePlayback = () => {
      const reducedMotion = reducedMotionQuery.matches;
      const mobile = mobileQuery.matches;

      reducedMotionRef.current = reducedMotion;
      mobileRef.current = mobile;

      const shouldCrossfade =
        !reducedMotion && !mobile;

      clearTransition();

      videos.forEach((video) => video?.pause());

      if (reducedMotion) {
        setCrossfadeEnabled(false);
        return;
      }

      if (!shouldCrossfade) {
        activeVideoRef.current = 0;

        setActiveVideo(0);
        setVisibleVideos([true, false]);
        setCrossfadeEnabled(false);

        const firstVideo = videos[0];

        if (firstVideo) {
          firstVideo.loop = true;

          void firstVideo.play().catch(() => {
            // Static fallback remains available.
          });
        }

        return;
      }

      videos.forEach((video) => {
        if (video) {
          video.loop = false;
        }
      });

      const currentIndex = activeVideoRef.current;
      const currentVideo = videos[currentIndex];

      setActiveVideo(currentIndex);

      setVisibleVideos(
        currentIndex === 0
          ? [true, false]
          : [false, true]
      );

      setCrossfadeEnabled(true);

      if (currentVideo) {
        void currentVideo.play().catch(() => {
          // Static fallback remains available.
        });
      }
    };

    updatePlayback();

    reducedMotionQuery.addEventListener(
      "change",
      updatePlayback
    );

    mobileQuery.addEventListener(
      "change",
      updatePlayback
    );

    return () => {
      reducedMotionQuery.removeEventListener(
        "change",
        updatePlayback
      );

      mobileQuery.removeEventListener(
        "change",
        updatePlayback
      );

      clearTransition();

      videos.forEach((video) => video?.pause());
    };
  }, [getVideos]);

  const handleVideoTimeUpdate = useCallback(
    (videoIndex: number) => {
      if (
        reducedMotionRef.current ||
        mobileRef.current ||
        transitionRef.current ||
        videoIndex !== activeVideoRef.current
      ) {
        return;
      }

      const videos = getVideos();

      const currentVideo = videos[videoIndex];

      const nextIndex = videoIndex === 0 ? 1 : 0;
      const nextVideo = videos[nextIndex];

      if (!currentVideo || !nextVideo) return;

      const duration = currentVideo.duration;

      if (
        !Number.isFinite(duration) ||
        duration <= CROSSFADE_DURATION
      ) {
        return;
      }

      const remainingTime =
        duration - currentVideo.currentTime;

      if (
        remainingTime > CROSSFADE_DURATION ||
        remainingTime < 0
      ) {
        return;
      }

      transitionRef.current = true;

      nextVideo.loop = false;
      nextVideo.currentTime = 0;

      void nextVideo
        .play()
        .then(() => {
          if (
            reducedMotionRef.current ||
            mobileRef.current
          ) {
            nextVideo.pause();
            transitionRef.current = false;
            return;
          }

          activeVideoRef.current = nextIndex;

          setActiveVideo(nextIndex);
          setVisibleVideos([true, true]);

          timeoutRef.current = setTimeout(() => {
            currentVideo.pause();
            currentVideo.currentTime = 0;

            setVisibleVideos(
              nextIndex === 0
                ? [true, false]
                : [false, true]
            );

            transitionRef.current = false;
            timeoutRef.current = null;
          }, CROSSFADE_DURATION * 1000);
        })
        .catch(() => {
          transitionRef.current = false;
          currentVideo.loop = true;
        });
    },
    [getVideos]
  );

  const handleVideoEnded = useCallback(
    (videoIndex: number) => {
      if (
        videoIndex !== activeVideoRef.current ||
        reducedMotionRef.current ||
        mobileRef.current ||
        transitionRef.current
      ) {
        return;
      }

      const video = getVideos()[videoIndex];

      if (!video) return;

      video.currentTime = 0;

      void video.play().catch(() => {
        // Static fallback remains available.
      });
    },
    [getVideos]
  );

  const videoTransition = crossfadeEnabled
    ? `opacity ${CROSSFADE_DURATION}s ease-in-out`
    : "none";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#100B09]"
    >
      <div className="absolute inset-0">
        <Image
          src="/images/discovery/cheesy-burger.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-[85%_50%] opacity-60"
        />
      </div>

      <video
        ref={firstVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onTimeUpdate={() => handleVideoTimeUpdate(0)}
        onEnded={() => handleVideoEnded(0)}
        className="cinema-video absolute inset-0 h-full w-full object-cover object-[70%_center] lg:object-center"
        style={{
          opacity: visibleVideos[0] ? 1 : 0,
          zIndex: activeVideo === 0 ? 2 : 1,
          transition: videoTransition,
        }}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      <video
        ref={secondVideoRef}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onTimeUpdate={() => handleVideoTimeUpdate(1)}
        onEnded={() => handleVideoEnded(1)}
        className="cinema-video absolute inset-0 hidden h-full w-full object-cover object-[70%_center] lg:object-center md:block"
        style={{
          opacity: visibleVideos[1] ? 1 : 0,
          zIndex: activeVideo === 1 ? 2 : 1,
          transition: videoTransition,
        }}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-[3] bg-[linear-gradient(90deg,rgba(7,5,4,0.92)_0%,rgba(9,6,5,0.76)_18%,rgba(10,7,5,0.47)_35%,rgba(10,7,5,0.11)_58%,transparent_78%)]" />

      <div className="absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(8,6,5,0.13)_0%,transparent_28%,transparent_80%,rgba(8,6,5,0.25)_100%)]" />

      <div className="absolute inset-0 z-[3] bg-[linear-gradient(90deg,rgba(6,4,3,0.24),transparent_88%)] lg:hidden" />
    </div>
  );
}

/* ============================================================
   MAIN SEARCH EXPERIENCE
============================================================ */

export default function FoodSearchExperience() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [query, setQuery] = useState("");

  const [loadState, setLoadState] = useState<LoadState>(
    API_URL ? "loading" : "unconfigured"
  );

  const [reloadKey, setReloadKey] = useState(0);

  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);

  const [minimumSpice, setMinimumSpice] = useState(0);

  const [maximumPrice, setMaximumPrice] =
    useState<number | null>(null);

  const [sortBy, setSortBy] =
    useState<SortOption>("name-asc");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const resultsRef = useDiscoveryReveal();

  /* ==========================================================
     FETCH REAL DISHES
  ========================================================== */

  useEffect(() => {
    if (!API_URL) return;

    const controller = new AbortController();

    async function loadDishes() {
      try {
        const response = await fetch(`${API_URL}/dishes/`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected dishes response");
        }

        if (controller.signal.aborted) return;

        const validDishes = data.filter(isDish);

        if (data.length !== validDishes.length) {
          console.warn(
            "Some dishes did not match the expected API fields.",
            {
              received: data.length,
              accepted: validDishes.length,
            }
          );
        }

        if (data.length > 0 && validDishes.length === 0) {
          throw new Error(
            "Dish response does not match expected fields"
          );
        }

        setDishes(validDishes);
        setLoadState("success");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Unable to load dishes:", error);

        setLoadState("error");
      }
    }

    void loadDishes();

    return () => controller.abort();
  }, [reloadKey]);

  /* ==========================================================
     DERIVED FILTER DATA
  ========================================================== */

  const categories = useMemo(() => {
    return [
      ...new Set(
        dishes.map((dish) => dish.category_id)
      ),
    ].sort((a, b) => a - b);
  }, [dishes]);

  const priceLimit = useMemo(() => {
    if (!dishes.length) return 0;

    return Math.ceil(
      dishes.reduce(
        (highest, dish) =>
          Math.max(highest, Number(dish.price)),
        0
      )
    );
  }, [dishes]);

  const effectiveMaximumPrice =
    maximumPrice === null
      ? priceLimit
      : Math.min(maximumPrice, priceLimit);

  const activeFilterCount =
    (selectedCategory !== null ? 1 : 0) +
    (minimumSpice > 0 ? 1 : 0) +
    (maximumPrice !== null &&
    effectiveMaximumPrice < priceLimit
      ? 1
      : 0);

  const hasRealDishes =
    loadState === "success" &&
    dishes.length > 0;

  /* ==========================================================
     CLIENT-SIDE SEARCH / FILTER / SORT
  ========================================================== */

  const filteredDishes = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    const results = dishes.filter((dish) => {
      const matchesSearch =
        !normalizedQuery ||
        dish.name
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === null ||
        dish.category_id === selectedCategory;

      const matchesSpice =
        dish.spice_level >= minimumSpice;

      const matchesPrice =
        Number(dish.price) <=
        effectiveMaximumPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSpice &&
        matchesPrice
      );
    });

    return results.sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return b.name.localeCompare(a.name);

        case "price-asc":
          return (
            Number(a.price) - Number(b.price) ||
            a.name.localeCompare(b.name)
          );

        case "price-desc":
          return (
            Number(b.price) - Number(a.price) ||
            a.name.localeCompare(b.name)
          );

        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [
    dishes,
    query,
    selectedCategory,
    minimumSpice,
    effectiveMaximumPrice,
    sortBy,
  ]);

  /* ==========================================================
     ACTIONS
  ========================================================== */

  const showResults = useCallback(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document
      .getElementById("food-search-results")
      ?.scrollIntoView({
        behavior: reducedMotion
          ? "auto"
          : "smooth",
      });
  }, []);

  const clearFilters = () => {
    setSelectedCategory(null);
    setMinimumSpice(0);
    setMaximumPrice(null);
    setSortBy("name-asc");
  };

  const clearDiscovery = () => {
    clearFilters();
    setQuery("");
  };

  const retryLoading = () => {
    if (!API_URL) return;

    setLoadState("loading");

    setReloadKey((previous) => previous + 1);
  };

  return (
    <div className="craving-cinema search-v8 min-h-screen bg-[#FFF1F3]">

      {/* ======================================================
          APPROVED V4.5 CINEMATIC HERO
      ====================================================== */}

      <section className="relative isolate flex min-h-[850px] items-center overflow-hidden bg-[#100B09] px-5 pb-20 pt-44 text-[#F8F0E6] sm:min-h-[880px] sm:px-10 sm:pb-24 sm:pt-48 lg:min-h-[880px] lg:px-14 lg:pb-28 lg:pt-48">
        <CinemaBackground />

        <div className="relative z-10 mx-auto w-full max-w-[1290px]">
          <div className="max-w-[590px]">
            <div className="cinema-reveal mb-7 flex items-center gap-4">
              <span className="cinema-line h-px w-9 shrink-0 bg-[#E9A59A]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#F1C6AF] sm:text-xs">
                Street Fresh / Food Discovery
              </span>
            </div>

            <div
              className="cinema-reveal"
              style={{ animationDelay: "120ms" }}
            >
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#EBD8C8]/75 sm:text-xs">
                Find something unforgettable
              </p>

              <h1 className="font-serif text-[clamp(2.75rem,4.6vw,5.1rem)] font-semibold leading-[1.06] tracking-[-0.065em]">
                <span className="block">
                  <span className="cinema-chrome-type">
                    FIND YOUR
                  </span>
                </span>

                <span className="mt-1 block">
                  <span className="cinema-ruby-type">
                    NEXT CRAVING.
                  </span>
                </span>
              </h1>
            </div>

            <p
              className="cinema-reveal mt-7 max-w-[450px] text-sm leading-7 text-[#F2E4D7]/90 sm:text-base sm:leading-8"
              style={{ animationDelay: "230ms" }}
            >
              From sizzling street-food favorites to unforgettable
              signature dishes. Discover flavors worth going out for.
            </p>

            <div
              className="cinema-reveal mt-10 w-full max-w-[590px]"
              style={{ animationDelay: "340ms" }}
            >
              <div className="cinema-search-shell rounded-[26px] p-[1.5px]">
                <div className="cinema-search-glass relative overflow-hidden rounded-[24px] backdrop-blur-xl">
                  <div
                    aria-hidden="true"
                    className="cinema-search-shine pointer-events-none absolute inset-y-0 left-0 w-[35%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.055),transparent)]"
                  />

                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                  <div className="relative flex items-center gap-2.5 px-3 py-2.5 sm:gap-4 sm:px-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-[#F3C49E]/15 bg-white/[0.07] sm:h-11 sm:w-11">
                      <Search
                        aria-hidden="true"
                        className="h-5 w-5 text-[#FFD3AF]"
                        strokeWidth={1.9}
                      />
                    </div>

                    <label
                      htmlFor="food-search-input"
                      className="sr-only"
                    >
                      Search food dishes
                    </label>

                    <input
                      id="food-search-input"
                      type="search"
                      value={query}
                      onChange={(event) =>
                        setQuery(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          showResults();
                        }
                      }}
                      placeholder="Momos, burgers, desserts..."
                      className="h-[52px] min-w-0 flex-1 appearance-none bg-transparent text-[13px] font-medium text-[#FFF9F2] caret-[#F4B789] outline-none placeholder:text-[#EAD5C6]/85 sm:h-[58px] sm:text-base"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EAB48D]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={showResults}
                      aria-label="View food search results"
                      className="cinema-copper-button group relative flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[17px] border border-[#FFD5B3]/45 bg-[linear-gradient(135deg,#FFE0BF_0%,#E9A273_45%,#B9683E_100%)] text-[#29160E] transition-[transform,filter] duration-300 hover:scale-[1.06] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFD2AD] motion-reduce:transform-none sm:h-[58px] sm:w-[58px]"
                    >
                      <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/75" />

                      <span className="pointer-events-none absolute -right-4 -top-5 h-12 w-12 rounded-full bg-white/25 blur-xl" />

                      <ArrowRight
                        aria-hidden="true"
                        className="relative h-[22px] w-[22px] transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none"
                        strokeWidth={2.2}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#E9AD7C]/85" />

                <span className="text-[11px] font-medium tracking-[0.04em] text-[#F6E5D7]/90">
                  Good food. Great discoveries.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={showResults}
              className="cinema-reveal cinema-explore-pill group mt-10 inline-flex min-h-[58px] max-w-full items-center gap-3 rounded-full border border-[#F1BD94]/45 py-2 pl-2 pr-5 text-left transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[#F7CCA9]/80 hover:shadow-[0_16px_42px_rgba(0,0,0,0.33)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F4C69E] motion-reduce:transform-none sm:gap-4 sm:pr-7"
              style={{ animationDelay: "450ms" }}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FFD6B2]/40 bg-[linear-gradient(135deg,#F2BD94,#CE8053)] text-[#28160E] shadow-[0_5px_18px_rgba(197,107,56,0.28)]">
                <ArrowDownRight
                  aria-hidden="true"
                  className="h-[19px] w-[19px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 motion-reduce:transform-none"
                  strokeWidth={2}
                />
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#FFF2E7] sm:text-xs sm:tracking-[0.16em]">
                Explore the discovery edit
              </span>

              <span className="ml-auto hidden h-1.5 w-1.5 shrink-0 rounded-full bg-[#EFB68A] shadow-[0_0_12px_rgba(239,182,138,0.65)] sm:block" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(227,169,123,0.35)_40%,transparent)]" />
      </section>

      {/* ======================================================
          V8 — BLUSH DISCOVERY STUDIO
      ====================================================== */}

      <section
        ref={resultsRef}
        id="food-search-results"
        aria-labelledby="discovery-heading"
        className="search-discovery"
      >
        <div
          aria-hidden="true"
          className="search-discovery-light"
        />

        <div className="search-discovery-container">

          {/* ==================================================
              EDITORIAL INTRODUCTION
          ================================================== */}

          <div
            className="search-discovery-introduction"
            data-search-reveal
          >
            <div className="search-intro-copy">
              <div className="search-eyebrow">
                <span className="search-eyebrow-line" />

                <span>
                  The Art of Food Discovery
                </span>
              </div>

              <h2
                id="discovery-heading"
                className="search-discovery-heading"
              >
                The Discovery
                <br />

                <span>Edit.</span>
              </h2>

              <p className="search-intro-description">
                Follow your cravings. Find the dish worth
                stepping out for, and explore genuine local
                food discoveries.
              </p>
            </div>

            <div className="search-editorial-note">
              <div className="search-editorial-icon">
                <Compass
                  size={25}
                  weight="duotone"
                  aria-hidden="true"
                />
              </div>

              <p className="search-micro-label">
                Your Food Compass
              </p>

              <p className="search-editorial-title">
                Find your kind
                <br />
                of delicious.
              </p>

              <p className="search-editorial-description">
                Discover real dishes and shape the gallery
                around your own taste.
              </p>
            </div>
          </div>

          {/* ==================================================
              GALLERY TOOLBAR
          ================================================== */}

          <div
            className="search-discovery-toolbar"
            data-search-reveal
          >
            <div className="search-toolbar-identity">
              <div className="search-toolbar-icon">
                <CookingPot
                  size={22}
                  weight="duotone"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="search-toolbar-title">
                  Explore the food gallery
                </p>

                <p
                  className="search-toolbar-subtitle"
                  aria-live="polite"
                >
                  {hasRealDishes
                    ? `${filteredDishes.length} of ${dishes.length} dishes`
                    : "Real dishes. Real discoveries."}
                </p>
              </div>
            </div>

            <div className="search-sort-wrapper">
              <ArrowsDownUp
                size={18}
                weight="duotone"
                aria-hidden="true"
                className="search-sort-icon"
              />

              <label
                htmlFor="discovery-sort"
                className="sr-only"
              >
                Sort dishes
              </label>

              <select
                id="discovery-sort"
                value={sortBy}
                disabled={!hasRealDishes}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as SortOption
                  )
                }
                className="search-sort-select"
              >
                <option value="name-asc">
                  Name: A–Z
                </option>

                <option value="name-desc">
                  Name: Z–A
                </option>

                <option value="price-asc">
                  Price: Low to High
                </option>

                <option value="price-desc">
                  Price: High to Low
                </option>
              </select>

              <CaretDown
                size={15}
                weight="bold"
                aria-hidden="true"
                className="search-sort-caret"
              />
            </div>
          </div>

          {/* ==================================================
              HORIZONTAL FILTER STUDIO
          ================================================== */}

          <div
            className="search-filter-studio"
            data-search-reveal
          >

            {/* HEADER */}

            <div className="search-filter-header">
              <div className="search-filter-heading-group">
                <div className="search-filter-header-icon">
                  <FadersHorizontal
                    size={25}
                    weight="duotone"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="search-filter-eyebrow">
                    Discovery Preferences
                  </p>

                  <h3 className="search-filter-title">
                    Refine your craving
                  </h3>
                </div>
              </div>

              <div className="search-filter-header-actions">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={
                    !hasRealDishes ||
                    (activeFilterCount === 0 &&
                      sortBy === "name-asc")
                  }
                  className="search-reset-button"
                >
                  <ArrowCounterClockwise
                    size={17}
                    weight="duotone"
                    aria-hidden="true"
                  />

                  Reset
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMobileFiltersOpen(
                      (previous) => !previous
                    )
                  }
                  aria-expanded={mobileFiltersOpen}
                  aria-controls="search-v8-filter-content"
                  className="search-mobile-filter-toggle"
                >
                  <span>Filters</span>

                  {activeFilterCount > 0 && (
                    <span className="search-filter-count">
                      {activeFilterCount}
                    </span>
                  )}

                  <CaretDown
                    size={16}
                    weight="bold"
                    aria-hidden="true"
                    className={
                      mobileFiltersOpen
                        ? "search-caret-rotated"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>

            {/* FILTER GRID */}

            <div
              id="search-v8-filter-content"
              className={`search-filter-grid ${
                mobileFiltersOpen
                  ? "search-filter-grid-open"
                  : ""
              }`}
            >

              {/* CATEGORY */}

              <div className="search-filter-column">
                <div className="search-filter-column-heading">
                  <span>01 / Food Category</span>

                  <ForkKnife
                    size={19}
                    weight="duotone"
                    aria-hidden="true"
                  />
                </div>

                <div className="search-category-wrapper">
                  <label
                    htmlFor="search-v8-category"
                    className="sr-only"
                  >
                    Filter by food category
                  </label>

                  <select
                    id="search-v8-category"
                    value={
                      selectedCategory === null
                        ? ""
                        : String(selectedCategory)
                    }
                    disabled={!hasRealDishes}
                    onChange={(event) =>
                      setSelectedCategory(
                        event.target.value === ""
                          ? null
                          : Number(event.target.value)
                      )
                    }
                    className="search-category-select"
                  >
                    <option value="">
                      All categories
                    </option>

                    {categories.map((categoryId) => (
                      <option
                        key={categoryId}
                        value={categoryId}
                      >
                        Category {categoryId}
                      </option>
                    ))}
                  </select>

                  <CaretDown
                    size={16}
                    weight="bold"
                    aria-hidden="true"
                    className="search-category-caret"
                  />
                </div>

                <p className="search-filter-helper">
                  {hasRealDishes
                    ? "Choose from available dish categories."
                    : "Categories appear when dishes load."}
                </p>
              </div>

              {/* SPICE */}

              <div className="search-filter-column">
                <div className="search-filter-column-heading">
                  <span>02 / Spice Preference</span>

                  <Fire
                    size={19}
                    weight="duotone"
                    aria-hidden="true"
                  />
                </div>

                <div
                  role="group"
                  aria-label="Minimum spice level"
                  className="search-spice-choices"
                >
                  {[0, 1, 2, 3, 4, 5].map(
                    (level) => (
                      <button
                        key={level}
                        type="button"
                        disabled={!hasRealDishes}
                        aria-label={
                          level === 0
                            ? "All spice levels"
                            : `Minimum spice level ${level}`
                        }
                        aria-pressed={
                          minimumSpice === level
                        }
                        onClick={() =>
                          setMinimumSpice(level)
                        }
                        className={`search-spice-choice ${
                          minimumSpice === level
                            ? "search-spice-selected"
                            : ""
                        }`}
                      >
                        {level}
                      </button>
                    )
                  )}
                </div>

                <p className="search-filter-helper">
                  {minimumSpice === 0
                    ? "All spice levels"
                    : `At least ${minimumSpice} out of 5`}
                </p>
              </div>

              {/* PRICE */}

              <div className="search-filter-column">
                <div className="search-filter-column-heading">
                  <span>03 / Maximum Price</span>

                  <span className="search-currency-symbol">
                    INR
                  </span>
                </div>

                {hasRealDishes ? (
                  <div className="search-price-controls">
                    <div className="search-price-values">
                      <span>Up to</span>

                      <strong>
                        {formatPrice(
                          effectiveMaximumPrice
                        )}
                      </strong>
                    </div>

                    <label
                      htmlFor="search-v8-price"
                      className="sr-only"
                    >
                      Maximum dish price
                    </label>

                    <input
                      id="search-v8-price"
                      type="range"
                      min={0}
                      max={Math.max(priceLimit, 1)}
                      step={0.01}
                      value={effectiveMaximumPrice}
                      onChange={(event) =>
                        setMaximumPrice(
                          Number(event.target.value)
                        )
                      }
                      className="search-price-range"
                    />

                    <div className="search-price-limits">
                      <span>{formatPrice(0)}</span>

                      <span>
                        {formatPrice(priceLimit)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="search-price-preview">
                    <p>
                      Awaiting dish prices
                    </p>

                    <span>
                      Real prices will determine
                      this range.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CONNECTION NOTICE */}

            {!hasRealDishes && (
              <div className="search-filter-preview-notice">
                <PlugsConnected
                  size={20}
                  weight="duotone"
                  aria-hidden="true"
                />

                <p>
                  Discovery filters are ready.
                  They become interactive when
                  real dishes are available.
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              ACTIVE FILTER CHIPS
          ================================================== */}

          {hasRealDishes &&
            (activeFilterCount > 0 ||
              query.trim()) && (
              <div className="search-active-filters">
                {query.trim() && (
                  <FilterChip
                    label={`Search: ${query.trim()}`}
                    onRemove={() => setQuery("")}
                  />
                )}

                {selectedCategory !== null && (
                  <FilterChip
                    label={`Category ${selectedCategory}`}
                    onRemove={() =>
                      setSelectedCategory(null)
                    }
                  />
                )}

                {minimumSpice > 0 && (
                  <FilterChip
                    label={`Spice ${minimumSpice}+`}
                    onRemove={() =>
                      setMinimumSpice(0)
                    }
                  />
                )}

                {maximumPrice !== null &&
                  effectiveMaximumPrice <
                    priceLimit && (
                    <FilterChip
                      label={`Up to ${formatPrice(
                        effectiveMaximumPrice
                      )}`}
                      onRemove={() =>
                        setMaximumPrice(null)
                      }
                    />
                  )}

                <button
                  type="button"
                  onClick={clearDiscovery}
                  className="search-clear-all"
                >
                  Clear all
                </button>
              </div>
            )}

          {/* ==================================================
              RESULTS STAGE
          ================================================== */}

          <div className="search-results-stage">

            {/* LOADING */}

            {loadState === "loading" && (
              <div
                role="status"
                className="search-food-grid"
              >
                <span className="sr-only">
                  Loading dishes...
                </span>

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="search-skeleton-card"
                  >
                    <div className="search-skeleton-image" />

                    <div className="search-skeleton-content">
                      <div className="search-skeleton-line search-skeleton-line-short" />

                      <div className="search-skeleton-line" />

                      <div className="search-skeleton-line search-skeleton-line-medium" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BACKEND UNCONFIGURED */}

            {loadState === "unconfigured" && (
              <StatusPanel
                icon="connection"
                eyebrow="Discovery Connection"
                title="Something delicious awaits."
                description="Your food gallery is ready to discover real local dishes. Connect the FastAPI backend to bring the listings to life."
                note="Frontend ready · Data connection pending"
              />
            )}

            {/* CONNECTION ERROR */}

            {loadState === "error" && (
              <StatusPanel
                icon="error"
                eyebrow="Connection Interrupted"
                title="The gallery needs a moment."
                description="We couldn't load the dishes. Check your FastAPI server, database connection, API configuration and CORS settings."
                action={
                  <button
                    type="button"
                    onClick={retryLoading}
                    className="search-status-action"
                  >
                    <ArrowCounterClockwise
                      size={18}
                      weight="duotone"
                      aria-hidden="true"
                    />

                    Try again
                  </button>
                }
              />
            )}

            {/* EMPTY DATABASE OR NO MATCH */}

            {loadState === "success" &&
              filteredDishes.length === 0 && (
                <StatusPanel
                  icon="search"
                  eyebrow={
                    dishes.length === 0
                      ? "Awaiting Real Dishes"
                      : "No Matching Dishes"
                  }
                  title={
                    dishes.length === 0
                      ? "The menu is waiting."
                      : "Try another craving."
                  }
                  description={
                    dishes.length === 0
                      ? "No dishes have been added to the database yet. New listings will appear here when available."
                      : "No dishes match your search and preferences. Try adjusting your filters."
                  }
                  action={
                    dishes.length > 0 ? (
                      <button
                        type="button"
                        onClick={clearDiscovery}
                        className="search-status-action search-status-action-outline"
                      >
                        <ArrowCounterClockwise
                          size={18}
                          weight="duotone"
                          aria-hidden="true"
                        />

                        Clear search & filters
                      </button>
                    ) : undefined
                  }
                />
              )}

            {/* REAL DISH GALLERY */}

            {loadState === "success" &&
              filteredDishes.length > 0 && (
                <div
                  aria-live="polite"
                  className="search-food-grid"
                >
                  {filteredDishes.map((dish, index) => (
                    <DishCard
                      key={dish.dish_id}
                      dish={dish}
                      index={index}
                    />
                  ))}
                </div>
              )}
          </div>

          {/* ==================================================
              SECTION CLOSING
          ================================================== */}

          <div className="search-section-closing">
            <div className="search-closing-identity">
              <span className="search-closing-icon">
                <ForkKnife
                  size={18}
                  weight="duotone"
                  aria-hidden="true"
                />
              </span>

              <span>
                Made for the love of good food
              </span>
            </div>

            <span className="search-closing-signature">
              Cheat Meal Finder / Discovery
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   ACTIVE FILTER CHIP
============================================================ */

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="search-filter-chip"
    >
      <span>{label}</span>

      <X
        aria-hidden="true"
        size={14}
      />
    </button>
  );
}

/* ============================================================
   REAL DISH CARD
============================================================ */

function DishCard({
  dish,
  index,
}: {
  dish: Dish;
  index: number;
}) {
  const spiceLevel = Math.max(
    0,
    Math.min(5, Math.round(dish.spice_level))
  );

  const imageSrc =
    dish.image_url &&
    (dish.image_url.startsWith("/") ||
      /^https?:\/\//i.test(dish.image_url))
      ? dish.image_url
      : null;

  return (
    <article
      className="search-dish-card"
      style={{
        animationDelay: `${Math.min(index, 8) * 75}ms`,
      }}
    >
      <div className="search-dish-image">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={dish.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="search-dish-photo"
          />
        ) : (
          <div className="search-image-fallback">
            <ForkKnife
              size={45}
              weight="duotone"
              aria-hidden="true"
            />

            <span>
              Image unavailable
            </span>
          </div>
        )}

        <div className="search-image-shade" />

        <div className="search-category-badge">
          <ForkKnife
            size={14}
            weight="duotone"
            aria-hidden="true"
          />

          Category {dish.category_id}
        </div>
      </div>

      <div className="search-dish-content">
        <div className="search-dish-meta">
          <span>
            Food Discovery
          </span>

          <strong>
            {formatPrice(dish.price)}
          </strong>
        </div>

        <h3 className="search-dish-name">
          {dish.name}
        </h3>

        {dish.description && (
          <p className="search-dish-description">
            {dish.description}
          </p>
        )}

        <div className="search-spice-footer">
          <div className="search-spice-label">
            <Fire
              size={18}
              weight="duotone"
              aria-hidden="true"
            />

            <span>
              Spice {spiceLevel}/5
            </span>
          </div>

          <div
            className="search-spice-dots"
            aria-hidden="true"
          >
            {Array.from(
              { length: 5 },
              (_, dotIndex) => (
                <span
                  key={dotIndex}
                  className={`search-spice-dot ${
                    dotIndex < spiceLevel
                      ? "search-spice-dot-active"
                      : ""
                  }`}
                />
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   CONNECTION / ERROR / EMPTY STATE
============================================================ */

function StatusPanel({
  icon,
  eyebrow,
  title,
  description,
  note,
  action,
}: {
  icon: "connection" | "error" | "search";
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
  action?: ReactNode;
}) {
  const Icon =
    icon === "connection"
      ? Sparkle
      : icon === "error"
        ? WarningCircle
        : MagnifyingGlass;

  return (
    <div
      role="status"
      className="search-status-panel"
    >
      <div
        aria-hidden="true"
        className="search-status-decoration"
      >
        <Compass
          size={250}
          weight="thin"
        />
      </div>

      <div className="search-status-content">
        <div className="search-status-icon">
          <Icon
            size={29}
            weight="duotone"
            aria-hidden="true"
          />
        </div>

        <div className="search-status-copy">
          <p className="search-status-eyebrow">
            {eyebrow}
          </p>

          <h3 className="search-status-title">
            {title}
          </h3>

          <p className="search-status-description">
            {description}
          </p>

          {action}
        </div>
      </div>

      {note && (
        <div className="search-status-note">
          <CheckCircle
            size={17}
            weight="duotone"
            aria-hidden="true"
          />

          <span>
            {note}
          </span>
        </div>
      )}
    </div>
  );
}