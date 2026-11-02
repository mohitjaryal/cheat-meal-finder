"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowClockwise,
  ArrowRight,
  ArrowUpRight,
  BowlFood,
  Compass,
  ForkKnife,
  MagnifyingGlass,
  MapPin,
  X,
} from "@phosphor-icons/react";

import DiscoveryNavbar from "@/components/discovery/DiscoveryNavbar";
import DiscoveryFooter from "@/components/discovery/DiscoveryFooter";

type Category = {
  category_id: number;
  name: string;
};

type LoadStatus =
  | "loading"
  | "success"
  | "error"
  | "unconfigured";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const FOOD_IMAGES = {
  momos: "/images/discovery/spicy-momos.png",
  noodles: "/images/discovery/chilli-garlic-noodles.png",
  pavBhaji: "/images/discovery/butter-pav-bhaji.png",
  burger: "/images/discovery/cheesy-burger.png",
  jalebi: "/images/discovery/rabri-malai-jalebi.png",
};

/* ============================================================
   CATEGORIES V1.7 — REVEAL MOTION
   Refresh entrances + reliable scroll reveals
   ============================================================ */

function useCategoriesMotion() {
  const pageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = pageRef.current;

    if (!root) return;

    const elements = Array.from(
      root.querySelectorAll<HTMLElement>(
        "[data-ci-reveal]"
      )
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (
      reducedMotion.matches ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((element) => {
        element.classList.add("ci-motion-visible");
      });

      return;
    }

    /*
     * First mark elements already visible in the viewport.
     * This allows refresh animations to run immediately.
     *
     * Elements farther down remain ready for scroll reveal.
     */

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;

          element.classList.add("ci-motion-visible");

          observer.unobserve(element);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -7% 0px",
        threshold: 0.08,
      }
    );

    root.classList.add("ci-motion-active");

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      root.classList.remove("ci-motion-active");
    };
  }, []);

  return pageRef;
}

/* ============================================================
   DATA VALIDATION
   ============================================================ */

function isCategory(value: unknown): value is Category {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.category_id === "number" &&
    Number.isInteger(record.category_id) &&
    typeof record.name === "string"
  );
}

/* ============================================================
   DIRECTORY MESSAGE
   ============================================================ */

function DirectoryMessage({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="ci-message" role="status">
      <span className="ci-message-icon">
        <Compass size={25} weight="duotone" />
      </span>

      <span className="ci-message-eyebrow">
        {eyebrow}
      </span>

      <h3>{title}</h3>

      <p>{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="ci-message-action"
          onClick={onAction}
        >
          {actionLabel}

          <ArrowClockwise
            size={17}
            weight="bold"
          />
        </button>
      )}
    </div>
  );
}

/* ============================================================
   SECTION 01 — THE CRAVING DIRECTORY
   ============================================================ */

function CravingDirectory() {
  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [status, setStatus] = useState<LoadStatus>(
    API_URL ? "loading" : "unconfigured"
  );

  const [query, setQuery] = useState("");

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!API_URL) return;

    const controller = new AbortController();

    async function loadCategories() {
      setStatus("loading");

      try {
        const response = await fetch(
          `${API_URL}/categories`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Categories request failed: ${response.status}`
          );
        }

        const data: unknown = await response.json();

        if (
          !Array.isArray(data) ||
          !data.every(isCategory)
        ) {
          throw new Error(
            "Unexpected categories response"
          );
        }

        const sorted = [...data].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        if (!controller.signal.aborted) {
          setCategories(sorted);
          setStatus("success");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(
            "Unable to load categories:",
            error
          );

          setCategories([]);
          setStatus("error");
        }
      }
    }

    void loadCategories();

    return () => controller.abort();
  }, [retryCount]);

  const currentStatus: LoadStatus = API_URL
    ? status
    : "unconfigured";

  const filteredCategories = useMemo(() => {
    const search = query.trim().toLowerCase();

    return search
      ? categories.filter((category) =>
          category.name
            .toLowerCase()
            .includes(search)
        )
      : categories;
  }, [categories, query]);

  const canSearch =
    currentStatus === "success" &&
    categories.length > 0;

  return (
    <section
      className="ci-discovery"
      id="discover-categories"
      aria-labelledby="ci-page-title"
    >
      <div className="ci-container">
        {/* PAGE INTRO */}

        <header
          className="ci-page-intro ci-reveal ci-reveal-intro"
          data-ci-reveal
        >
          <div className="ci-eyebrow">
            <span className="ci-eyebrow-icon">
              <ForkKnife
                size={16}
                weight="bold"
              />
            </span>

            <span>THE CRAVING INDEX</span>

            <span className="ci-eyebrow-line" />

            <span>EXPLORE BY TASTE</span>
          </div>

          <div className="ci-page-intro-grid">
            <h1 id="ci-page-title">
              WHAT ARE YOU
              <br />
              <span>CRAVING?</span>
            </h1>

            <p>
              Sometimes you know exactly what you
              want. Sometimes all you need is a
              little inspiration. Start with a
              craving and see where it takes you.
            </p>
          </div>
        </header>

        {/* DIRECTORY + FOOD EDITORIAL */}

        <div className="ci-discovery-layout">
          <div
            className="ci-directory ci-reveal ci-reveal-directory"
            data-ci-reveal
          >
            <div className="ci-directory-header">
              <div>
                <p className="ci-small-label">
                  <span className="ci-label-dot" />

                  YOUR FOOD DIRECTORY
                </p>

                <h2>
                  Find your
                  <br />
                  <em>kind of delicious.</em>
                </h2>
              </div>

              <div className="ci-directory-icon">
                <Compass
                  size={27}
                  weight="duotone"
                />
              </div>
            </div>

            <p className="ci-directory-description">
              Explore the food categories in our
              collection. Pick what sounds good
              to you.
            </p>

            {canSearch && (
              <div className="ci-search">
                <label htmlFor="ci-category-search">
                  SEARCH CATEGORIES
                </label>

                <div className="ci-search-input">
                  <MagnifyingGlass
                    size={19}
                    weight="bold"
                    aria-hidden="true"
                  />

                  <input
                    id="ci-category-search"
                    type="search"
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="What sounds good?"
                    autoComplete="off"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear category search"
                    >
                      <X
                        size={16}
                        weight="bold"
                      />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* LOADING */}

            {currentStatus === "loading" && (
              <div
                className="ci-category-list"
                aria-label="Loading food categories"
                aria-busy="true"
              >
                {Array.from(
                  { length: 5 },
                  (_, index) => (
                    <div
                      className="ci-skeleton-row"
                      key={index}
                    >
                      <span />
                      <span />
                      <span />
                    </div>
                  )
                )}
              </div>
            )}

            {/* API UNCONFIGURED */}

            {currentStatus ===
              "unconfigured" && (
              <DirectoryMessage
                eyebrow="DISCOVERY COMING SOON"
                title="The collection is getting ready."
                description="Food categories will appear here once the database connection is configured."
              />
            )}

            {/* API ERROR */}

            {currentStatus === "error" && (
              <DirectoryMessage
                eyebrow="CONNECTION INTERRUPTED"
                title="We lost the food trail."
                description="We couldn't load the categories right now. Give it another try."
                actionLabel="TRY AGAIN"
                onAction={() =>
                  setRetryCount(
                    (count) => count + 1
                  )
                }
              />
            )}

            {/* EMPTY DATABASE */}

            {currentStatus === "success" &&
              categories.length === 0 && (
                <DirectoryMessage
                  eyebrow="NOTHING LISTED YET"
                  title="Something tasty is coming."
                  description="There are no food categories in the database yet. Check back as the collection grows."
                />
              )}

            {/* NO SEARCH MATCHES */}

            {currentStatus === "success" &&
              categories.length > 0 &&
              filteredCategories.length === 0 && (
                <DirectoryMessage
                  eyebrow="NO MATCHES"
                  title="Try another craving."
                  description="No category matches your search. Try a different word."
                  actionLabel="CLEAR SEARCH"
                  onAction={() =>
                    setQuery("")
                  }
                />
              )}

            {/* LIVE CATEGORY RESULTS */}

                        {currentStatus === "success" &&
              filteredCategories.length > 0 && (
                <div
                  className="ci-category-list"
                  aria-label="Food categories"
                >
                  {filteredCategories.map((category, index) => (
                    <Link
                      key={category.category_id}
                      href={`/search?category=${category.category_id}#food-search-results`}
                      className="ci-category-row"
                    >
                      <span className="ci-category-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="ci-category-name">
                        {category.name}
                      </span>

                      <span className="ci-category-arrow">
                        <ArrowUpRight
                          size={18}
                          weight="bold"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  ))}
                </div>
              )}

            {/* DIRECTORY FOOTER */}

                        <div className="ci-directory-footer">
              <p>
                <span />
                A GOOD CRAVING IS A GOOD PLACE TO START.
              </p>
            </div>
          </div>

          {/* FOOD EDITORIAL */}

          <div
            className="ci-food-editorial ci-reveal ci-reveal-editorial"
            data-ci-reveal
          >
            <div className="ci-editorial-top">
              <span>THE FOOD EDIT</span>
              <span>01 / 02</span>
            </div>

            <div className="ci-editorial-canvas">
              <div className="ci-editorial-halo" />

              <div className="ci-editorial-noodles">
                <Image
                  src={FOOD_IMAGES.noodles}
                  alt="Chilli garlic noodles"
                  fill
                  priority
                  sizes="(max-width: 700px) 80vw, (max-width: 1200px) 44vw, 470px"
                  className="ci-food-image"
                />
              </div>

              <div className="ci-editorial-pav">
                <Image
                  src={FOOD_IMAGES.pavBhaji}
                  alt="Butter pav bhaji"
                  fill
                  sizes="(max-width: 700px) 44vw, 230px"
                  className="ci-food-image"
                />
              </div>

              <div className="ci-editorial-handwritten ci-editorial-curious-v2">
                <span className="ci-curious-icon">
                  <BowlFood
                    size={28}
                    weight="duotone"
                    aria-hidden="true"
                  />
                </span>

                <p>
                  FOR THE
                  <br />
                  FOOD CURIOUS
                </p>
              </div>

              <span className="ci-editorial-vertical">
                GOOD FOOD. GREAT DISCOVERIES.
              </span>
            </div>

            <div className="ci-editorial-bottom">
              <div>
                <strong>01</strong>
                <span>/</span>
                <span>THE GOOD STUFF</span>
              </div>

              <p>
                From comfort-food classics to
                bold street-side favorites,
                there&apos;s always another flavor
                worth discovering.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION END */}

        <div
          className="ci-section-end ci-reveal ci-reveal-section-end"
          data-ci-reveal
        >
          <span>FOLLOW YOUR APPETITE</span>

          <span className="ci-section-end-line" />

          <span>
            THERE&apos;S MORE TO TASTE
          </span>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 02 — CRAVING FINALE
   ============================================================ */

function CravingFinale() {
  return (
    <section
      className="ci-finale"
      aria-labelledby="ci-finale-title"
    >
      <div className="ci-container ci-finale-layout">
        {/* FINALE COPY */}

        <div className="ci-finale-copy">
          <div
            className="ci-finale-eyebrow ci-reveal ci-reveal-finale-eyebrow"
            data-ci-reveal
          >
            <span>
              <MapPin
                size={17}
                weight="fill"
              />
            </span>

            YOUR NEXT FOOD FIND STARTS HERE
          </div>

          <h2
            id="ci-finale-title"
            className="ci-reveal ci-reveal-finale-title"
            data-ci-reveal
          >
            GOOD FOOD
            <br />
            IS CLOSER
            <br />
            <span>THAN YOU THINK.</span>
          </h2>

          <p
            className="ci-reveal ci-reveal-finale-description"
            data-ci-reveal
          >
            That little street-side favorite.
            The dish everyone keeps talking
            about. The place you haven&apos;t
            discovered yet. Your next great
            food find is waiting.
          </p>

          <div
            className="ci-reveal ci-reveal-finale-action"
            data-ci-reveal
          >
            <Link
              href="/search"
              className="ci-finale-button"
            >
              <ForkKnife
                size={20}
                weight="bold"
              />

              <span>
                EXPLORE ALL DISHES
              </span>

              <span className="ci-finale-button-arrow">
                <ArrowRight
                  size={21}
                  weight="bold"
                />
              </span>
            </Link>
          </div>

          <div
            className="ci-finale-caption ci-reveal ci-reveal-finale-caption"
            data-ci-reveal
          >
            <span />

            DISCOVER DISHES. FIND YOUR
            FAVORITES.
          </div>
        </div>

        {/* FOOD GALLERY */}

        <div
          className="ci-gallery ci-gallery-motion"
          data-ci-gallery
        >
          <div className="ci-gallery-backdrop" />

          <div className="ci-gallery-food ci-gallery-momos">
            <Image
              src={FOOD_IMAGES.momos}
              alt="Spicy momos"
              fill
              sizes="(max-width: 700px) 65vw, 340px"
              className="ci-food-image"
            />
          </div>

          <div className="ci-gallery-food ci-gallery-burger">
            <Image
              src={FOOD_IMAGES.burger}
              alt="Cheesy burger"
              fill
              sizes="(max-width: 700px) 37vw, 210px"
              className="ci-food-image"
            />
          </div>

          <div className="ci-gallery-food ci-gallery-jalebi">
            <Image
              src={FOOD_IMAGES.jalebi}
              alt="Rabri malai jalebi"
              fill
              sizes="(max-width: 700px) 35vw, 195px"
              className="ci-food-image"
            />
          </div>

          <div className="ci-gallery-food ci-gallery-pav">
            <Image
              src={FOOD_IMAGES.pavBhaji}
              alt="Butter pav bhaji"
              fill
              sizes="(max-width: 700px) 40vw, 225px"
              className="ci-food-image"
            />
          </div>

          <div className="ci-gallery-stamp ci-gallery-stamp-v2">
            <small>THE</small>

            <strong>GOOD</strong>
            <strong>STUFF.</strong>

            <ArrowUpRight
              size={19}
              weight="bold"
            />
          </div>

          <div className="ci-gallery-label">
            <span />

            FOOD WORTH FINDING
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MAIN CATEGORIES EXPERIENCE
   ============================================================ */

export default function FoodCategoriesExperience() {
  const pageRef = useCategoriesMotion();

  return (
    <main
      ref={pageRef}
      id="top"
      className="craving-index-v1 ci-premium-v11 ci-motion-v17"
    >
      <div className="sticky top-0 z-50 -mb-[78px] sm:-mb-[86px] lg:-mb-[90px]">
        <DiscoveryNavbar />
      </div>

      <CravingDirectory />

      <CravingFinale />

      <DiscoveryFooter />
    </main>
  );
}