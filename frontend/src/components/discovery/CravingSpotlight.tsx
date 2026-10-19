"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/* ================================================================
   STREET FRESH — THE CRAVING STAGE V5.4.1
   RESPONSIVE MOBILE SELECTOR POLISH
   LIQUID EMERALD CULINARY THEATRE
   CINEMATIC FOOD & FLAVOR TRANSITIONS
   STREET FRESH MOTION FLOW V3
================================================================ */

type SpotlightDish = {
  id: number;
  number: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  flavorNote: string;
  image: string;
  accent: string;
  glow: string;
  entranceX: number;
  entranceY: number;
  entranceRotation: number;
};

const spotlightDishes: SpotlightDish[] = [
  {
    id: 1,
    number: "01",
    name: "Tandoori Chicken Wings",
    shortName: "Tandoori Wings",
    category: "SMOKY STREET FAVORITES",
    description:
      "Fire-kissed chicken wings wrapped in bold tandoori flavors, finished with irresistible smoky char.",
    flavorNote: "Smoky • Bold • Char-Grilled",
    image: "/images/discovery/tandoori-chicken-wings.png",
    accent: "#B94F2A",
    glow: "rgba(232,116,65,0.30)",
    entranceX: -45,
    entranceY: 25,
    entranceRotation: -5,
  },
  {
    id: 2,
    number: "02",
    name: "Loaded Masala Fries",
    shortName: "Masala Fries",
    category: "ULTIMATE CHEAT MEALS",
    description:
      "Golden crispy fries layered with creamy cheese, tangy sauces and a generous street-style masala kick.",
    flavorNote: "Crispy • Cheesy • Spiced",
    image: "/images/discovery/loaded-masala-fries.png",
    accent: "#936017",
    glow: "rgba(238,182,69,0.30)",
    entranceX: 45,
    entranceY: 25,
    entranceRotation: 5,
  },
  {
    id: 3,
    number: "03",
    name: "Kolkata Kathi Roll",
    shortName: "Kathi Roll",
    category: "STREET FOOD CLASSICS",
    description:
      "Flaky golden paratha embracing rich spiced fillings, inspired by the unmistakable flavors of Kolkata.",
    flavorNote: "Flaky • Savory • Street-Style",
    image: "/images/discovery/kolkata-kathi-roll.png",
    accent: "#566B35",
    glow: "rgba(150,183,91,0.28)",
    entranceX: 0,
    entranceY: 55,
    entranceRotation: -3,
  },
  {
    id: 4,
    number: "04",
    name: "Chocolate Waffle",
    shortName: "Chocolate Waffle",
    category: "SWEET INDULGENCES",
    description:
      "Golden Belgian waffles dressed in rich melted chocolate, creamy vanilla ice cream and fresh strawberries.",
    flavorNote: "Sweet • Creamy • Chocolate",
    image: "/images/discovery/chocolate-waffle.png",
    accent: "#8D4A35",
    glow: "rgba(205,135,98,0.28)",
    entranceX: 0,
    entranceY: 30,
    entranceRotation: 4,
  },
];

const AUTO_ROTATE_MS = 4500;
const MANUAL_PAUSE_MS = 9000;

/* ================================================================
   SINGLE LIQUID EMERALD BACKGROUND
================================================================ */

function MetallicStageBackground({
  dish,
}: {
  dish: SpotlightDish;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#8EAA96]" />

      <div className="absolute inset-0 bg-[linear-gradient(115deg,#DCE9DA_0%,#A8C1AC_20%,#739883_45%,#BCD3BC_72%,#9BB9A1_100%)]" />

      <div className="craving-liquid-light absolute -inset-[35%] bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.28)_42%,rgba(232,250,233,0.40)_50%,rgba(255,255,255,0.18)_58%,transparent_75%)] opacity-70" />

      <div
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background: `
            radial-gradient(
              ellipse at 53% 58%,
              ${dish.glow} 0%,
              transparent 61%
            )
          `,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(24,55,35,0.17)_0.5px,transparent_0.9px)] bg-[length:17px_17px] opacity-[0.12]" />

      <div className="absolute left-[-12%] top-[8%] h-[420px] w-[52%] bg-[#F1FFF0]/25 blur-[115px]" />

      <div className="absolute bottom-[-20%] right-[-10%] h-[460px] w-[48%] bg-[#E6F4E5]/28 blur-[120px]" />
    </div>
  );
}

/* ================================================================
   LEFT — DESKTOP CRAVING INDEX
================================================================ */

function CravingIndex({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-7 text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#234332]/80">
        Choose Your Craving
      </p>

      <div className="flex flex-col">
        {spotlightDishes.map((dish, index) => {
          const active = activeIndex === index;

          return (
            <button
              key={dish.id}
              type="button"
              aria-label={`Show ${dish.name}`}
              aria-pressed={active}
              onClick={() => onSelect(index)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  onSelect(index);
                }
              }}
              data-spotlight-reveal
              data-spotlight-type="index-item"
              style={{
                transitionDelay: `${index * 120}ms`,
              }}
              className={`group relative flex w-full items-center gap-4 border-b border-[#234332]/20 py-6 text-left transition-colors duration-300 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#234332] ${
                active
                  ? "text-[#173323]"
                  : "text-[#234332]/65 hover:text-[#173323]"
              }`}
            >
              <span
                className={`font-display text-xs font-bold tracking-[0.15em] ${
                  active
                    ? "text-[#234332]"
                    : "text-[#234332]/55"
                }`}
              >
                {dish.number}
              </span>

              <span
                className={`min-w-0 flex-1 font-display text-[clamp(1.05rem,1.45vw,1.45rem)] font-bold tracking-[-0.045em] transition-transform duration-300 motion-safe:group-hover:translate-x-1 ${
                  active ? "text-[#173323]" : ""
                }`}
              >
                {dish.shortName}
              </span>

              <span
                aria-hidden="true"
                className={`text-lg transition-all duration-300 ${
                  active
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-2 opacity-0"
                }`}
                style={{
                  color: dish.accent,
                }}
              >
                ↗
              </span>

              <span
                aria-hidden="true"
                className={`absolute bottom-[-1px] left-0 h-[2px] transition-[width] duration-500 ${
                  active ? "w-full" : "w-0"
                }`}
                style={{
                  backgroundColor: dish.accent,
                }}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-xs leading-6 text-[#234332]/75">
        Explore four signature cravings.
        <br />
        Select a dish to discover its flavor story.
      </p>
    </div>
  );
}

/* ================================================================
   CENTER — RESPONSIVE CINEMATIC FOOD STAGE
================================================================ */

function FoodStage({
  activeIndex,
  reducedMotion,
}: {
  activeIndex: number;
  reducedMotion: boolean;
}) {
  const activeDish = spotlightDishes[activeIndex];

  return (
    <div className="relative isolate flex min-h-[290px] w-full min-w-0 items-center justify-center sm:min-h-[440px] lg:min-h-[610px]">
      {/* Atmospheric lighting */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-full -translate-x-1/2 -translate-y-1/2 rounded-full blur-[65px] transition-[background-color] duration-1000 sm:h-[90%] sm:blur-[90px]"
        style={{
          backgroundColor: activeDish.glow,
        }}
      />

      {/* Ground shadow */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[12%] left-1/2 h-[10%] w-[70%] -translate-x-1/2 rounded-full bg-[#173323]/25 blur-[28px] sm:bottom-[14%] sm:blur-[35px]"
      />

      {/* Decorative steam */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[10%] z-10 h-[48%] w-[60%] -translate-x-1/2 overflow-hidden"
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`craving-steam absolute bottom-0 h-[70%] w-[18%] rounded-full bg-white/25 blur-[22px] ${
              reducedMotion ? "hidden" : ""
            }`}
            style={{
              left: `${22 + index * 22}%`,
              animationDelay: `${index * 1.1}s`,
            }}
          />
        ))}
      </div>

      {/* Persistent food layers */}

      <div className="relative z-20 h-[290px] w-full min-w-0 sm:h-[440px] lg:h-[620px] lg:w-[120%]">
        {spotlightDishes.map((dish, index) => {
          const active = index === activeIndex;

          return (
            <div
              key={dish.id}
              aria-hidden={!active}
              className={`absolute inset-0 transition-[opacity,transform,filter] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                active
                  ? "z-20 opacity-100 blur-0"
                  : "pointer-events-none z-10 opacity-0 blur-[3px]"
              }`}
              style={{
                transform:
                  active || reducedMotion
                    ? "translate3d(0,0,0) rotate(0deg) scale(1)"
                    : `translate3d(${dish.entranceX}px,${dish.entranceY}px,0) rotate(${dish.entranceRotation}deg) scale(0.9)`,
              }}
            >
              <div
                className={`relative h-full w-full ${
                  active && !reducedMotion
                    ? "craving-food-breathe"
                    : ""
                }`}
              >
                <div className="relative h-full w-full px-2 sm:px-4 lg:px-0">
                  <Image
                    src={dish.image}
                    alt={active ? dish.name : ""}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 52vw"
                    className="object-contain drop-shadow-[0_25px_25px_rgba(23,51,35,0.32)] sm:drop-shadow-[0_35px_30px_rgba(23,51,35,0.35)]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cinematic reflection */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-[60%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 mix-blend-screen blur-[75px]"
        style={{
          backgroundColor: activeDish.glow,
        }}
      />

      {/* Stage caption */}

      <div className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#234332]/75 sm:tracking-[0.3em]">
        The Flavor Showcase
      </div>
    </div>
  );
}

/* ================================================================
   RIGHT — ANIMATED FLAVOR STORY
================================================================ */

function FlavorStory({
  dish,
  activeIndex,
  reducedMotion,
}: {
  dish: SpotlightDish;
  activeIndex: number;
  reducedMotion: boolean;
}) {
  return (
    <div className="w-full min-w-0 lg:pl-3">
      <div
        key={dish.id}
        className={
          reducedMotion
            ? ""
            : "craving-flavor-story-enter"
        }
      >
        {/* Section label */}

        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: dish.accent,
            }}
          />

          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#234332]">
            Flavor Story
          </p>
        </div>

        {/* Category */}

        <p
          className={`mb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] sm:mb-4 sm:tracking-[0.19em] ${
            reducedMotion ? "" : "craving-story-category"
          }`}
          style={{
            color: dish.accent,
          }}
        >
          {dish.category}
        </p>

        {/* Dish name */}

        <h3
          className={`font-display text-[clamp(2rem,8vw,3.6rem)] font-bold leading-[1.08] tracking-[-0.06em] text-[#173323] lg:text-[clamp(2.2rem,3.1vw,3.6rem)] ${
            reducedMotion ? "" : "craving-story-title"
          }`}
        >
          {dish.name}
        </h3>

        {/* Description */}

        <p
          className={`mt-5 max-w-md text-sm leading-7 text-[#234332]/85 sm:mt-6 ${
            reducedMotion ? "" : "craving-story-description"
          }`}
        >
          {dish.description}
        </p>

        {/* Flavor profile */}

        <div
          className={`mt-7 border-l-2 border-[#234332]/30 pl-4 sm:mt-8 sm:pl-5 ${
            reducedMotion ? "" : "craving-story-profile"
          }`}
        >
          <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#234332]/65">
            The Flavor Profile
          </p>

          <p className="font-display text-sm font-semibold text-[#173323]">
            {dish.flavorNote}
          </p>
        </div>
      </div>

      {/* Responsive progress indicator */}

      <div className="mt-9 flex w-full min-w-0 items-center gap-3 sm:mt-12 sm:gap-4">
        <span className="shrink-0 font-display text-2xl font-bold text-[#234332] sm:text-3xl">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>

        <div className="flex min-w-0 flex-1 gap-1.5 sm:gap-2">
          {spotlightDishes.map((item, index) => (
            <div
              key={item.id}
              className={`h-[3px] min-w-0 flex-1 rounded-full transition-colors duration-500 ${
                index === activeIndex
                  ? "bg-[#234332]"
                  : "bg-[#234332]/20"
              }`}
            />
          ))}
        </div>

        <span className="shrink-0 font-display text-xs font-bold text-[#234332]/55 sm:text-sm">
          04
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   MOBILE — PREMIUM 2×2 DISH SELECTOR V5.4.1
   SINGLE-LINE TEXT + ACTIVE ARROW
================================================================ */

function MobileDishSelector({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="w-full min-w-0 lg:hidden">
      <p className="mb-5 text-center text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#234332]">
        Explore The Menu
      </p>

      <div className="grid w-full min-w-0 grid-cols-2 gap-2.5 pb-2 sm:grid-cols-4 sm:gap-3">
        {spotlightDishes.map((dish, index) => {
          const active = index === activeIndex;

          return (
            <button
              key={dish.id}
              type="button"
              aria-label={`Show ${dish.name}`}
              aria-pressed={active}
              onClick={() => onSelect(index)}
              data-spotlight-reveal
              data-spotlight-type="index-item"
              style={{
                transitionDelay: `${index * 90}ms`,
              }}
              className={`group relative flex min-h-[52px] min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-1.5 py-3 text-center text-[clamp(9px,2.5vw,12px)] font-bold leading-none whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#234332] sm:gap-1.5 sm:px-3 sm:text-xs ${
                active
                  ? "border-[#234332] bg-[#234332] text-[#F4F6EF] shadow-[0_8px_20px_rgba(23,51,35,0.16)]"
                  : "border-[#234332]/30 bg-white/25 text-[#173323] active:bg-white/40"
              }`}
            >
              {/* Dish name — single line */}

              <span className="min-w-0 whitespace-nowrap">
                {dish.shortName}
              </span>

              {/* Active arrow */}

              <span
                aria-hidden="true"
                className={`inline-flex shrink-0 items-center justify-center overflow-hidden text-sm leading-none transition-[opacity,transform,width] duration-300 ${
                  active
                    ? "w-3 translate-x-0 opacity-100"
                    : "w-0 -translate-x-1 opacity-0"
                }`}
              >
                ↗
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function CravingSpotlight() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [manualPauseUntil, setManualPauseUntil] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);

  const activeDish = spotlightDishes[activeIndex];

  /* ============================================================
     REDUCED MOTION
  ============================================================ */

  useEffect(() => {
    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () => {
      setReducedMotion(query.matches);
    };

    update();

    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  /* ============================================================
     PAGE VISIBILITY
  ============================================================ */

  useEffect(() => {
    const update = () => {
      setIsPageVisible(!document.hidden);
    };

    update();

    document.addEventListener(
      "visibilitychange",
      update
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        update
      );
    };
  }, []);

  /* ============================================================
     SECTION VISIBILITY — AUTOPLAY
  ============================================================ */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  /* ============================================================
     MOTION FLOW V3 — SCROLL REVEALS
  ============================================================ */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const elements = Array.from(
      section.querySelectorAll<HTMLElement>(
        "[data-spotlight-reveal]"
      )
    );

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      elements.forEach((element) => {
        element.dataset.revealState = "visible";
      });

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target =
            entry.target as HTMLElement;

          target.dataset.revealState = "visible";

          observer.unobserve(target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    elements.forEach((element) => {
      element.dataset.revealState = "hidden";
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /* ============================================================
     MANUAL DISH SELECTION
  ============================================================ */

  const selectDish = useCallback(
    (index: number) => {
      setActiveIndex(index);

      setManualPauseUntil(
        Date.now() + MANUAL_PAUSE_MS
      );
    },
    []
  );

  /* ============================================================
     AUTOMATIC DISH ROTATION
  ============================================================ */

  useEffect(() => {
    if (
      reducedMotion ||
      !isVisible ||
      !isPageVisible
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      if (Date.now() < manualPauseUntil) {
        return;
      }

      setActiveIndex(
        (previous) =>
          (previous + 1) % spotlightDishes.length
      );
    }, AUTO_ROTATE_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    reducedMotion,
    isVisible,
    isPageVisible,
    manualPauseUntil,
  ]);

  return (
    <section
      ref={sectionRef}
      id="featured-dishes"
      aria-labelledby="spotlight-heading"
      className="relative isolate w-full min-w-0 overflow-hidden px-5 py-16 text-[#173323] sm:px-10 sm:py-20 lg:px-16 lg:py-24"
    >
      {/* ============================================================
          V5.2 ANIMATIONS — PRESERVED
      ============================================================ */}

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

      <MetallicStageBackground dish={activeDish} />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] min-w-0">
        {/* ============================================================
            SECTION HEADING
        ============================================================ */}

        <div className="mb-8 flex flex-col justify-between gap-6 sm:mb-12 lg:mb-14 lg:flex-row lg:items-end">
          <div className="min-w-0 max-w-4xl">
            <div
              data-spotlight-reveal
              data-spotlight-type="eyebrow"
              className="mb-4 flex items-center gap-4 sm:mb-5"
            >
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
              data-spotlight-reveal
              data-spotlight-type="heading"
              className="font-display text-[clamp(2.3rem,9vw,5.3rem)] font-bold leading-[1.02] tracking-[-0.065em] text-[#173323] sm:leading-[0.98] lg:text-[clamp(2.8rem,6vw,5.3rem)]"
            >
              EVERY CRAVING
              <br />

              <span className="text-[#3C684C]">
                HAS A STORY.
              </span>
            </h2>

            <p
              data-spotlight-reveal
              data-spotlight-type="description"
              className="mt-5 max-w-xl text-sm leading-6 text-[#234332]/85 sm:mt-6 sm:text-base sm:leading-7"
            >
              Four unforgettable flavors.
              One stage.
              Your next delicious discovery.
            </p>
          </div>

          <div
            data-spotlight-reveal
            data-spotlight-type="indicator"
            className="hidden text-right lg:block"
          >
            <p className="font-display text-5xl font-bold text-[#234332]">
              04
            </p>

            <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#234332]/65">
              Signature Cravings
            </p>
          </div>
        </div>

        {/* ============================================================
            INTERACTIVE CULINARY THEATRE
        ============================================================ */}

        <div className="grid w-full min-w-0 grid-cols-1 items-center gap-7 sm:gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.55fr)_minmax(0,0.9fr)] lg:gap-10 xl:gap-14">
          {/* Desktop craving index */}

          <div
            data-spotlight-reveal
            data-spotlight-type="index"
            className="hidden min-w-0 lg:block"
          >
            <CravingIndex
              activeIndex={activeIndex}
              onSelect={selectDish}
            />
          </div>

          {/* Food stage */}

          <div
            data-spotlight-reveal
            data-spotlight-type="stage"
            className="w-full min-w-0"
          >
            <FoodStage
              activeIndex={activeIndex}
              reducedMotion={reducedMotion}
            />
          </div>

          {/* Mobile selector */}

          <MobileDishSelector
            activeIndex={activeIndex}
            onSelect={selectDish}
          />

          {/* Flavor story */}

          <div
            data-spotlight-reveal
            data-spotlight-type="story"
            className="w-full min-w-0"
          >
            <FlavorStory
              dish={activeDish}
              activeIndex={activeIndex}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        {/* ============================================================
            SECTION FOOTER
        ============================================================ */}

        <div
          data-spotlight-reveal
          data-spotlight-type="footer"
          className="mt-12 flex flex-col justify-between gap-4 border-t border-[#234332]/20 pt-6 text-center sm:mt-16 sm:flex-row sm:text-left"
        >
          <p className="text-xs text-[#234332]/75">
            Four flavors. Endless stories.
          </p>

          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#234332]">
            Street Fresh Discovery
          </p>
        </div>

        <p
          data-spotlight-reveal
          data-spotlight-type="footer"
          className="mt-5 text-center text-xs text-[#234332]/65"
        >
          Spotlight dishes are currently frontend demo content.
        </p>
      </div>
    </section>
  );
}