"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type DiscoveryDish = {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  spiceLevel: number;
  background: string;
};

type OrbitSlot = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

const AUTO_ROTATE_INTERVAL = 3000;
const ORBIT_TRANSITION_DURATION = 900;

const dishes: DiscoveryDish[] = [
  {
    id: 1,
    name: "Spicy Street Momos",
    category: "STREET FOOD",
    description: "Steamed perfection with a fiery street-style kick.",
    image: "/images/discovery/spicy-momos.png",
    spiceLevel: 4,
    background: "#784027",
  },
  {
    id: 2,
    name: "The Cheesy Burger",
    category: "FAST FOOD",
    description:
      "Juicy layers, melted cheese, and bold street-style comfort.",
    image: "/images/discovery/cheesy-burger.png",
    spiceLevel: 1,
    background: "#D71920",
  },
  {
    id: 3,
    name: "Butter Pav Bhaji",
    category: "STREET FOOD",
    description:
      "Rich buttery bhaji with toasted pav and Mumbai street flavor.",
    image: "/images/discovery/butter-pav-bhaji.png",
    spiceLevel: 3,
    background: "#D65A13",
  },
  {
    id: 4,
    name: "Rabri Malai Jalebi",
    category: "DESSERT",
    description: "Golden jalebi paired with rich, creamy rabri.",
    image: "/images/discovery/rabri-malai-jalebi.png",
    spiceLevel: 0,
    background: "#C69212",
  },
  {
    id: 5,
    name: "Loaded Cheesy Nachos",
    category: "CHEAT MEAL",
    description:
      "Crunchy nachos, molten cheese, and bold toppings.",
    image: "/images/discovery/loaded-cheesy-nachos.png",
    spiceLevel: 2,
    background: "#176B43",
  },
];

const totalDishes = dishes.length;

const desktopSlots: OrbitSlot[] = [
  { x: 0, y: 0, scale: 1.22, opacity: 1, zIndex: 30 },
  { x: 76, y: -65, scale: 0.76, opacity: 0.96, zIndex: 15 },
  { x: 80, y: 68, scale: 0.76, opacity: 0.94, zIndex: 12 },
  { x: -80, y: 68, scale: 0.76, opacity: 0.94, zIndex: 12 },
  { x: -76, y: -65, scale: 0.76, opacity: 0.96, zIndex: 15 },
];

const mobileSlots: OrbitSlot[] = [
  { x: 0, y: 0, scale: 1.04, opacity: 1, zIndex: 30 },
  { x: 51, y: -83, scale: 0.54, opacity: 0.96, zIndex: 15 },
  { x: 54, y: 85, scale: 0.54, opacity: 0.94, zIndex: 12 },
  { x: -54, y: 85, scale: 0.54, opacity: 0.94, zIndex: 12 },
  { x: -51, y: -83, scale: 0.54, opacity: 0.96, zIndex: 15 },
];

export default function CravingOrbit() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [manualControl, setManualControl] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [manualAnnouncement, setManualAnnouncement] = useState("");

  const heroRef = useRef<HTMLElement>(null);

  const autoRotateTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeDish = dishes[activeIndex];

  /* ============================================================
     RESPONSIVE + REDUCED MOTION
  ============================================================ */

  useEffect(() => {
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const mobileQuery = window.matchMedia("(max-width: 639px)");

    const updatePreferences = () => {
      setReducedMotion(motionQuery.matches);
      setIsMobile(mobileQuery.matches);
    };

    updatePreferences();

    motionQuery.addEventListener("change", updatePreferences);
    mobileQuery.addEventListener("change", updatePreferences);

    return () => {
      motionQuery.removeEventListener("change", updatePreferences);
      mobileQuery.removeEventListener("change", updatePreferences);
    };
  }, []);

  /* ============================================================
     PAGE VISIBILITY
  ============================================================ */

  useEffect(() => {
    const updateVisibility = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };

    updateVisibility();

    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        updateVisibility
      );
    };
  }, []);

  /* ============================================================
     HERO VISIBILITY
  ============================================================ */

  useEffect(() => {
    const hero = heroRef.current;

    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  /* ============================================================
     MANUAL NAVIGATION
  ============================================================ */

  const handleManualChange = useCallback(
    (direction: number) => {
      setManualControl(true);

      if (autoRotateTimerRef.current) {
        clearTimeout(autoRotateTimerRef.current);
        autoRotateTimerRef.current = null;
      }

      const nextIndex =
        (activeIndex + direction + totalDishes) % totalDishes;

      setActiveIndex(nextIndex);

      setManualAnnouncement(
        `${dishes[nextIndex].name}, dish ${
          nextIndex + 1
        } of ${totalDishes}`
      );
    },
    [activeIndex]
  );

  /* ============================================================
     AUTO ROTATION
  ============================================================ */

  const canAutoRotate =
    !manualControl &&
    !reducedMotion &&
    isPageVisible &&
    isHeroVisible;

  useEffect(() => {
    if (!canAutoRotate) return;

    autoRotateTimerRef.current = setTimeout(() => {
      setActiveIndex(
        (current) => (current + 1) % totalDishes
      );
    }, AUTO_ROTATE_INTERVAL);

    return () => {
      if (autoRotateTimerRef.current) {
        clearTimeout(autoRotateTimerRef.current);
        autoRotateTimerRef.current = null;
      }
    };
  }, [activeIndex, canAutoRotate]);

  /* ============================================================
     PLAY / PAUSE
  ============================================================ */

  const toggleAutoRotation = () => {
    if (reducedMotion) return;

    setManualControl((current) => !current);
  };

  const orbitSlots = isMobile ? mobileSlots : desktopSlots;

  return (
    <section
      ref={heroRef}
      aria-labelledby="craving-heading"
      className="relative isolate flex min-h-screen w-full flex-col overflow-hidden text-cream"
      style={{
        backgroundColor: activeDish.background,
        transition: reducedMotion
          ? "none"
          : "background-color 900ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* METALLIC BACKGROUND */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.035) 45%, rgba(255,255,255,0.06) 100%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 48%, rgba(255,255,255,0.09), transparent 72%)",
          }}
        />

        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.025)_4px)]" />
      </div>

      {/* NAVBAR REMOVED — WILL BE RENDERED IN PAGE.TSX */}

      {/* HERO CONTENT */}

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 items-center px-5 pb-12 pt-32 sm:px-10 sm:pb-16 sm:pt-36 lg:px-14 lg:py-20 xl:px-16">
        <div className="grid w-full items-center gap-8 sm:gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.55fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">

          {/* LEFT CONTENT */}

          <div className="street-hero-left min-w-0 text-center lg:text-left">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-mustard sm:mb-6">
              Street Fresh Premium
            </p>

            <h1
              id="craving-heading"
              className="font-display text-[clamp(2.6rem,11vw,3.6rem)] leading-[1.02] font-bold tracking-[-0.065em] sm:text-6xl lg:text-[clamp(2.8rem,4.2vw,5.5rem)]"
            >
              WHAT
              <br />
              ARE YOU
              <br />
              <span className="text-mustard">CRAVING?</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xs text-sm leading-7 text-cream/85 lg:mx-0">
              Discover unforgettable street food, local legends,
              and flavors worth chasing.
            </p>

            <a
              href="#explore"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-mustard hover:text-espresso focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard lg:mt-9"
            >
              Explore cravings
              <span aria-hidden="true" className="ml-3">
                ↗
              </span>
            </a>
          </div>

          {/* CENTER ORBIT */}

          <div className="street-hero-orbit relative mx-auto flex h-[350px] w-full max-w-[360px] min-w-0 items-center justify-center sm:h-[520px] sm:max-w-[490px] lg:h-[540px]">

            {/* OUTER RING */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[300px] w-[300px] rounded-full border border-white/30 sm:h-[440px] sm:w-[440px]"
            />

            {/* INNER RING */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[225px] w-[225px] rounded-full border border-dashed border-white/20 sm:h-[345px] sm:w-[345px]"
            />

            {/* FOOD CAROUSEL */}

            <div
              className="relative h-full w-full"
              role="group"
              aria-label="Five signature food dishes"
              aria-roledescription="carousel"
            >
              {dishes.map((dish, index) => {
                const relativeIndex =
                  (index - activeIndex + totalDishes) % totalDishes;

                const slot = orbitSlots[relativeIndex];
                const isActive = relativeIndex === 0;

                return (
                  <div
                    key={dish.id}
                    aria-hidden={!isActive}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[175px] w-[175px] sm:h-[245px] sm:w-[245px]"
                    style={{
                      zIndex: slot.zIndex,
                      opacity: slot.opacity,
                      transform: `translate(-50%, -50%) translate(${slot.x}%, ${slot.y}%) scale(${slot.scale})`,
                      transition: reducedMotion
                        ? "none"
                        : `transform ${ORBIT_TRANSITION_DURATION}ms cubic-bezier(0.22,1,0.36,1), opacity ${ORBIT_TRANSITION_DURATION}ms ease`,
                    }}
                  >
                    {/* PLATE SHADOW */}

                    <div className="absolute bottom-[4%] left-[10%] h-[25%] w-[80%] rounded-full bg-black/55 blur-2xl" />

                    {/* FOOD IMAGE */}

                    <div className="relative h-full w-full">
                      <Image
                        src={dish.image}
                        alt={isActive ? dish.name : ""}
                        fill
                        priority={index === 0}
                        sizes="(max-width:640px) 175px, 245px"
                        className="object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COUNTER */}

            <div className="absolute bottom-0 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/30 bg-black/25 px-5 py-2 text-xs font-bold tracking-[0.3em] text-white backdrop-blur-lg">
              {String(activeIndex + 1).padStart(2, "0")} / 05
            </div>
          </div>

          {/* RIGHT CONTENT */}

          <div className="street-hero-right min-w-0 text-center lg:pl-4 lg:text-left">
            <div className="mb-5 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[0.25em] text-mustard backdrop-blur-md">
              {activeDish.category}
            </div>

            <div>
              <h2 className="font-display text-4xl leading-tight font-bold tracking-[-0.05em] sm:text-5xl lg:text-[clamp(2rem,3vw,3.5rem)]">
                {activeDish.name}
              </h2>

              <p className="mx-auto mt-5 max-w-xs text-sm leading-7 text-cream/85 lg:mx-0">
                {activeDish.description}
              </p>
            </div>

            {/* SPICE LEVEL */}

            <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/75">
                Spice Level
              </span>

              <div
                className="flex gap-1.5"
                role="img"
                aria-label={`Spice level ${activeDish.spiceLevel} out of 5`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={`h-2 w-5 rounded-full ${
                      index < activeDish.spiceLevel
                        ? "bg-terracotta"
                        : "bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* NAVIGATION */}

            <div className="mt-10 flex justify-center gap-3 lg:justify-start">
              <button
                type="button"
                aria-label="Previous dish"
                onClick={() => handleManualChange(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/10 text-lg text-white backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard"
              >
                ←
              </button>

              <button
                type="button"
                aria-label="Next dish"
                onClick={() => handleManualChange(1)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/10 text-lg text-white backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard"
              >
                →
              </button>

              <button
                type="button"
                aria-label={
                  manualControl
                    ? "Resume automatic rotation"
                    : "Pause automatic rotation"
                }
                onClick={toggleAutoRotation}
                disabled={reducedMotion}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-white/10 text-lg text-white backdrop-blur-md transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mustard disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">
                  {manualControl || reducedMotion ? "▶" : "Ⅱ"}
                </span>
              </button>
            </div>

            {/* STATUS */}

            <p className="mt-4 text-xs text-cream/70">
              {reducedMotion
                ? "Automatic rotation disabled for reduced motion"
                : manualControl
                  ? "Manual mode · Press play to resume"
                  : "Auto rotating · Explore five signature cravings"}
            </p>

            {/* SCREEN READER ANNOUNCEMENT */}

            <div
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {manualAnnouncement}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}