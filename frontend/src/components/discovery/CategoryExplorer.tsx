"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CategoryCard = {
  id: number;
  name: string;
  tagline: string;
  image: string;
  background: string;
  highlight: string;
};

type TattooArtwork = {
  id: string;
  image: string;
  desktopPosition: string;
  mobilePosition: string;
  entranceX: number;
  entranceY: number;
  entranceRotation: number;
  finalRotation: number;
  delay: number;
};

const categories: CategoryCard[] = [
  {
    id: 1,
    name: "Street Food",
    tagline:
      "The soul of every street. Bold flavors. Authentic bites.",
    image: "/images/discovery/spicy-momos.png",
    background: "#D34B27",
    highlight: "#F78A51",
  },
  {
    id: 2,
    name: "Fast Food",
    tagline: "Big bites. Bigger cravings.",
    image: "/images/discovery/cheesy-burger.png",
    background: "#D94F45",
    highlight: "#F88B75",
  },
  {
    id: 3,
    name: "Desserts",
    tagline: "A little sweetness goes a long way.",
    image: "/images/discovery/rabri-malai-jalebi.png",
    background: "#D9A21B",
    highlight: "#F5C94D",
  },
  {
    id: 4,
    name: "Indo-Chinese",
    tagline: "Where bold flavors collide.",
    image: "/images/discovery/chilli-garlic-noodles.png",
    background: "#347345",
    highlight: "#65A36A",
  },
  {
    id: 5,
    name: "Cheat Meals",
    tagline:
      "Because cravings deserve a celebration.",
    image: "/images/discovery/butter-pav-bhaji.png",
    background: "#CA682C",
    highlight: "#ED9951",
  },
];

const tattooArtworks: TattooArtwork[] = [
  {
    id: "momos",
    image: "/images/discovery/momos-tattoo.png",
    desktopPosition:
      "left-0 top-0 h-[230px] w-[230px] lg:h-[285px] lg:w-[285px]",
    mobilePosition:
      "left-2 top-1 h-[105px] w-[105px]",
    entranceX: -130,
    entranceY: -130,
    entranceRotation: -42,
    finalRotation: -18,
    delay: 0,
  },
  {
    id: "burger",
    image: "/images/discovery/burger-tattoo.png",
    desktopPosition:
      "right-0 top-0 h-[240px] w-[240px] lg:h-[295px] lg:w-[295px]",
    mobilePosition:
      "right-2 top-1 h-[105px] w-[105px]",
    entranceX: 130,
    entranceY: -130,
    entranceRotation: 42,
    finalRotation: 18,
    delay: 160,
  },
  {
    id: "jalebi",
    image: "/images/discovery/jalebi-rabri-tattoo.png",
    desktopPosition:
      "left-0 bottom-0 h-[240px] w-[240px] lg:h-[295px] lg:w-[295px]",
    mobilePosition:
      "left-3 bottom-3 h-[110px] w-[110px]",
    entranceX: -130,
    entranceY: 130,
    entranceRotation: 38,
    finalRotation: 15,
    delay: 320,
  },
  {
    id: "noodles",
    image: "/images/discovery/noodles-tattoo.png",
    desktopPosition:
      "right-0 bottom-0 h-[240px] w-[240px] lg:h-[295px] lg:w-[295px]",
    mobilePosition:
      "right-3 bottom-3 h-[110px] w-[110px]",
    entranceX: 130,
    entranceY: 130,
    entranceRotation: -38,
    finalRotation: -16,
    delay: 480,
  },
];

function MetallicCardSurface({
  category,
  featured = false,
}: {
  category: CategoryCard;
  featured?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden rounded-[inherit]"
      style={{
        backgroundColor: category.background,
        backgroundImage: `
          radial-gradient(
            ellipse at 15% 5%,
            ${category.highlight}BB 0%,
            transparent 58%
          ),
          linear-gradient(
            125deg,
            rgba(255,255,255,0.18) 0%,
            rgba(255,255,255,0.07) 34%,
            transparent 65%,
            rgba(255,255,255,0.04) 100%
          )
        `,
      }}
    >
      <div className="pointer-events-none absolute -left-[65%] -top-[45%] h-[170%] w-[85%] rotate-[28deg] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70 transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-[45%]" />

      <div className="pointer-events-none absolute inset-x-[5%] top-0 h-[32%] rounded-[50%] bg-white/10 blur-3xl" />

      <div
        className={`pointer-events-none absolute rounded-full border border-white/30 ${
          featured
            ? "-right-32 -top-28 h-[420px] w-[420px]"
            : "-right-24 -top-24 h-72 w-72"
        }`}
      />

      <div
        className={`pointer-events-none absolute rounded-full border border-white/15 ${
          featured
            ? "-right-16 -top-12 h-[300px] w-[300px]"
            : "-right-14 -top-14 h-52 w-52"
        }`}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.22)_0.5px,transparent_0.8px)] bg-[length:10px_10px] opacity-[0.12]" />

      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_2px_2px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(255,255,255,0.08)]" />
    </div>
  );
}

function CategoryFoodImage({
  category,
  featured = false,
}: {
  category: CategoryCard;
  featured?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none relative z-20 w-full ${
        featured
          ? "h-[215px] sm:h-[310px] lg:h-[360px]"
          : "h-[175px] sm:h-[185px] lg:h-[160px]"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute bottom-[5%] left-1/2 -translate-x-1/2 rounded-full bg-black/30 blur-[26px] ${
          featured
            ? "h-[16%] w-[65%]"
            : "h-[15%] w-[55%]"
        }`}
      />

      <div className="relative h-full w-full transition-transform duration-700 ease-out motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:scale-[1.05]">
        <Image
          src={category.image}
          alt=""
          fill
          sizes={
            featured
              ? "(max-width: 640px) 90vw, (max-width: 1024px) 75vw, 48vw"
              : "(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 24vw"
          }
          className="object-contain drop-shadow-[0_25px_28px_rgba(20,10,7,0.38)]"
        />
      </div>
    </div>
  );
}

function CinematicTattooBackground({
  visible,
  reducedMotion,
}: {
  visible: boolean;
  reducedMotion: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse at 12% 10%,
              rgba(255,248,220,0.95),
              transparent 40%
            ),
            radial-gradient(
              ellipse at 85% 78%,
              rgba(171,108,43,0.38),
              transparent 48%
            ),
            linear-gradient(
              125deg,
              #F6DFA7 0%,
              #DDB36D 24%,
              #FFF0C7 43%,
              #BE8747 72%,
              #EECF91 100%
            )
          `,
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_15%,rgba(255,255,255,0.25)_36%,rgba(255,249,224,0.35)_48%,transparent_65%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(85,49,20,0.20)_0.5px,transparent_0.8px)] bg-[length:13px_13px] opacity-[0.12]" />

      {/* DESKTOP TATTOOS */}

      {tattooArtworks.map((tattoo) => (
        <div
          key={tattoo.id}
          className={`absolute hidden sm:block ${tattoo.desktopPosition}`}
          style={{
            opacity: visible || reducedMotion ? 0.4 : 0,
            transform:
              visible || reducedMotion
                ? `translate3d(0,0,0) rotate(${tattoo.finalRotation}deg)`
                : `translate3d(${tattoo.entranceX}px,${tattoo.entranceY}px,0) rotate(${tattoo.entranceRotation}deg)`,
            transition: reducedMotion
              ? "none"
              : `opacity 1050ms ease ${tattoo.delay}ms,
                 transform 1350ms cubic-bezier(0.22,1,0.36,1) ${tattoo.delay}ms`,
          }}
        >
          <Image
            src={tattoo.image}
            alt=""
            fill
            sizes="295px"
            className="object-contain grayscale contrast-125 brightness-75 mix-blend-multiply"
          />
        </div>
      ))}

      {/* MOBILE TATTOOS */}

      {tattooArtworks.map((tattoo) => (
        <div
          key={`${tattoo.id}-mobile`}
          className={`absolute sm:hidden ${tattoo.mobilePosition}`}
          style={{
            opacity: visible || reducedMotion ? 0.38 : 0,
            transform:
              visible || reducedMotion
                ? `translate3d(0,0,0) rotate(${tattoo.finalRotation}deg)`
                : `translate3d(${tattoo.entranceX * 0.6}px,${tattoo.entranceY * 0.6}px,0) rotate(${tattoo.entranceRotation}deg)`,
            transition: reducedMotion
              ? "none"
              : `opacity 900ms ease ${tattoo.delay}ms,
                 transform 1100ms cubic-bezier(0.22,1,0.36,1) ${tattoo.delay}ms`,
          }}
        >
          <Image
            src={tattoo.image}
            alt=""
            fill
            sizes="110px"
            className="object-contain grayscale contrast-125 brightness-75 mix-blend-multiply"
          />
        </div>
      ))}

      <div className="absolute -left-40 top-[18%] h-[520px] w-[520px] rounded-full border border-white/30 bg-white/10 blur-[1px]" />

      <div className="absolute -right-40 bottom-[15%] h-[520px] w-[520px] rounded-full border border-white/25 bg-white/10 blur-[1px]" />

      <div className="absolute inset-x-0 top-0 h-px bg-white/85" />
    </div>
  );
}

function CategoryArrow() {
  return (
    <span
      aria-hidden="true"
      className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/55 bg-white/15 text-lg backdrop-blur-md"
    >
      ↗
    </span>
  );
}

export default function CategoryExplorer() {
  const sectionRef = useRef<HTMLElement>(null);

  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const featured = categories[0];
  const supporting = categories.slice(1);

  /* ============================================================
     REDUCED MOTION
  ============================================================ */

  useEffect(() => {
    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () => setReducedMotion(query.matches);

    update();

    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  /* ============================================================
     SECTION VISIBILITY — EXISTING TATTOO ANIMATION
  ============================================================ */

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /* ============================================================
     INDIVIDUAL CONTENT SCROLL REVEALS
  ============================================================ */

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const elements = Array.from(
      section.querySelectorAll<HTMLElement>(
        "[data-category-reveal]"
      )
    );

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
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

          const target = entry.target as HTMLElement;

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

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="categories"
      aria-labelledby="categories-heading"
      className="relative isolate overflow-hidden px-5 py-20 pb-36 text-espresso sm:px-10 sm:py-24 sm:pb-24 lg:px-16 lg:py-28"
    >
      <CinematicTattooBackground
        visible={visible}
        reducedMotion={reducedMotion}
      />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ============================================================
            SECTION HEADING
        ============================================================ */}

        <div className="mb-14 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">

          <div className="max-w-3xl">

            {/* EYEBROW */}

            <div
              data-category-reveal
              data-reveal-type="text"
              className="mb-5 flex items-center gap-4"
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-terracotta">
                A World of Flavors
              </p>

              <span
                aria-hidden="true"
                className="hidden h-px w-12 bg-terracotta/70 sm:block"
              />
            </div>

            {/* HEADING */}

            <h2
              id="categories-heading"
              data-category-reveal
              data-reveal-type="heading"
              className="font-display text-5xl leading-[0.98] font-bold tracking-[-0.065em] sm:text-6xl lg:text-7xl"
            >
              PICK YOUR
              <br />
              <span className="text-terracotta">
                CRAVING.
              </span>
            </h2>

            {/* DESCRIPTION */}

            <p
              data-category-reveal
              data-reveal-type="text"
              className="mt-7 max-w-xl text-sm leading-7 text-muted sm:text-base"
            >
              From legendary street corners to indulgent sweet
              escapes, discover the flavors that make every craving
              unforgettable.
            </p>
          </div>

          {/* EDITORIAL INDICATOR */}

          <div
            data-category-reveal
            data-reveal-type="text"
            className="hidden shrink-0 text-right lg:block"
          >
            <p className="font-display text-5xl font-bold tracking-[-0.08em] text-terracotta">
              05
            </p>

            <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-muted">
              Flavor Worlds
            </p>

            <div className="ml-auto mt-4 h-px w-28 bg-terracotta/40" />
          </div>
        </div>

        {/* ============================================================
            CATEGORY GALLERY
        ============================================================ */}

        <div className="grid grid-cols-1 gap-9 lg:grid-cols-[1.05fr_1fr] lg:items-stretch lg:gap-12">

          {/* FEATURED STREET FOOD */}

          <article
            data-category-reveal
            data-reveal-type="featured"
            className="group relative isolate min-h-[495px] sm:min-h-[570px] lg:min-h-[650px]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white/55 shadow-[0_26px_65px_rgba(44,26,20,0.20)] transition-transform duration-700 ease-out motion-safe:lg:-rotate-2 motion-safe:group-hover:rotate-0">
              <MetallicCardSurface
                category={featured}
                featured
              />
            </div>

            {/* FEATURED BADGE */}

            <div className="absolute left-7 top-7 z-30 sm:left-10 sm:top-10">
              <span className="inline-flex items-center gap-3 rounded-full border border-white/45 bg-white/15 px-4 py-2 text-[10px] font-extrabold tracking-[0.22em] text-white backdrop-blur-md">
                01
                <span className="h-1 w-1 rounded-full bg-white/80" />
                FEATURED
              </span>
            </div>

            {/* FEATURED FOOD IMAGE */}

            <div className="absolute inset-x-5 top-[15%] z-20 sm:inset-x-8 sm:top-[17%] lg:inset-x-[-5%] lg:top-[17%]">
              <CategoryFoodImage
                category={featured}
                featured
              />
            </div>

            {/* FEATURED CONTENT */}

            <div className="absolute inset-x-7 bottom-9 z-30 text-white sm:inset-x-12 sm:bottom-12">
              <div
                aria-hidden="true"
                className="mb-4 h-px w-14 bg-white/70"
              />

              <h3 className="font-display text-4xl font-bold tracking-[-0.06em] sm:text-5xl">
                Street Food
              </h3>

              <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-white/95">
                {featured.tagline}
              </p>

              <span
                aria-hidden="true"
                className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/15 text-xl backdrop-blur-md"
              >
                ↗
              </span>
            </div>
          </article>

          {/* ============================================================
              SUPPORTING CATEGORY CARDS
          ============================================================ */}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:auto-rows-fr lg:gap-7">

            {supporting.map((category, index) => (
              <article
                key={category.id}
                data-category-reveal
                data-reveal-type="card"
                style={{
                  transitionDelay: `${index * 110}ms`,
                }}
                className={`group relative isolate min-h-[350px] sm:min-h-[330px] lg:min-h-0 ${
                  index % 2 === 0
                    ? "lg:-translate-y-3"
                    : "lg:translate-y-3"
                }`}
              >
                {/* METALLIC CARD */}

                <div className="absolute inset-0 overflow-hidden rounded-[2.25rem] border border-white/55 shadow-[0_20px_45px_rgba(44,26,20,0.17)] transition-[transform,box-shadow] duration-500 ease-out motion-safe:group-hover:-translate-y-1.5 motion-safe:group-hover:shadow-[0_28px_60px_rgba(44,26,20,0.22)]">
                  <MetallicCardSurface category={category} />
                </div>

                {/* CATEGORY NUMBER */}

                <span className="absolute left-6 top-6 z-30 inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-white/50 bg-white/15 px-2 text-[10px] font-extrabold tracking-[0.18em] text-white backdrop-blur-md">
                  {String(category.id).padStart(2, "0")}
                </span>

                {/* FOOD IMAGE */}

                <div className="absolute inset-x-5 top-[14%] z-20 sm:inset-x-4 lg:top-[12%]">
                  <CategoryFoodImage category={category} />
                </div>

                {/* CARD CONTENT */}

                <div className="absolute inset-x-6 bottom-7 z-30 text-white">
                  <h3 className="font-display text-[1.8rem] font-bold leading-tight tracking-[-0.055em]">
                    {category.name}
                  </h3>

                  <p className="mt-2 max-w-[230px] text-xs font-semibold leading-5 text-white/95">
                    {category.tagline}
                  </p>

                  <CategoryArrow />
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ============================================================
            SECTION FOOTER
        ============================================================ */}

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-espresso/15 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-semibold text-espresso/70">
            Five flavor worlds. Endless cravings.
          </p>

          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-terracotta">
            Street Fresh Discovery
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-espresso/65">
          Category previews are currently frontend demo content.
        </p>
      </div>
    </section>
  );
}