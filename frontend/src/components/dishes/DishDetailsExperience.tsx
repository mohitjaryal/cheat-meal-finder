"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Compass,
  Flame,
  MapPin,
  RefreshCw,
  Star,
  Store,
  ShieldCheck,
  Sparkles,
  Navigation,
  Heart,
  MessageCircle,
  BadgeCheck,
  MoveUpRight,
  ChefHat,
} from "lucide-react";

import DiscoveryNavbar from "@/components/discovery/DiscoveryNavbar";
import DiscoveryFooter from "@/components/discovery/DiscoveryFooter";

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

type Vendor = {
  vendor_id: number;
  name: string;
  location: string | null;
  opening_hours: string | null;
  vendor_type: string | null;
};

type Review = {
  review_id: number;
  dish_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  is_flagged: boolean;
};

type LoadStatus =
  | "loading"
  | "success"
  | "error"
  | "not-found"
  | "unconfigured";

type ResourceStatus = "loading" | "success" | "error";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

/* =====================================================
   API PARSING
   The API sends spice as text ("None", "Mild", "Hot")
   and may omit optional fields. We normalise everything
   here so the UI works with one clean shape.
   ===================================================== */

const SPICE_LEVEL_LABELS = new Map<string, number>([
  ["none", 0],
  ["no spice", 0],
  ["mild", 2],
  ["medium", 3],
  ["hot", 4],
  ["extra hot", 5],
  ["very hot", 5],
]);

function normalizeSpiceLevel(value: unknown): number | null {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return Math.min(5, Math.max(0, value));
  }

  if (typeof value === "string") {
    const key = value.trim().toLowerCase();
    const labelled = SPICE_LEVEL_LABELS.get(key);

    if (labelled !== undefined) return labelled;

    const parsed = Number(key);

    if (key !== "" && Number.isFinite(parsed)) {
      return Math.min(5, Math.max(0, parsed));
    }

    return 0;
  }

  return null;
}

function parseDish(value: unknown): Dish | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  const dishId = record.dish_id;
  const vendorId = record.vendor_id;
  const categoryId = record.category_id;
  const name = record.name;
  const price = record.price;
  const description = record.description ?? null;
  const imageUrl = record.image_url ?? null;
  const spiceLevel = normalizeSpiceLevel(record.spice_level);

  if (typeof dishId !== "number" || !Number.isInteger(dishId)) {
    return null;
  }

  if (typeof vendorId !== "number") return null;
  if (typeof categoryId !== "number") return null;
  if (typeof name !== "string") return null;

  if (typeof price !== "number" && typeof price !== "string") {
    return null;
  }

  if (spiceLevel === null) return null;

  if (description !== null && typeof description !== "string") {
    return null;
  }

  if (imageUrl !== null && typeof imageUrl !== "string") {
    return null;
  }

  return {
    dish_id: dishId,
    vendor_id: vendorId,
    category_id: categoryId,
    name,
    price,
    spice_level: spiceLevel,
    description,
    image_url: imageUrl,
  };
}

function parseVendor(value: unknown): Vendor | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  const vendorId = record.vendor_id;
  const name = record.name;
  const location = record.location ?? null;
  const openingHours = record.opening_hours ?? null;
  const vendorType = record.vendor_type ?? null;

  if (typeof vendorId !== "number") return null;
  if (typeof name !== "string") return null;

  if (location !== null && typeof location !== "string") {
    return null;
  }

  if (openingHours !== null && typeof openingHours !== "string") {
    return null;
  }

  if (vendorType !== null && typeof vendorType !== "string") {
    return null;
  }

  return {
    vendor_id: vendorId,
    name,
    location,
    opening_hours: openingHours,
    vendor_type: vendorType,
  };
}

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.review_id === "number" &&
    typeof record.dish_id === "number" &&
    typeof record.user_id === "number" &&
    typeof record.rating === "number" &&
    Number.isInteger(record.rating) &&
    record.rating >= 1 &&
    record.rating <= 5 &&
    (typeof record.comment === "string" ||
      record.comment === null) &&
    typeof record.created_at === "string" &&
    typeof record.is_flagged === "boolean"
  );
}

function formatPrice(price: number | string): string {
  const parsed = Number(price);

  if (!Number.isFinite(parsed)) return "Price unavailable";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(parsed);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatVendorType(value: string | null): string {
  if (!value) return "Food vendor";

  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function resolveImageUrl(value: string | null): string | null {
  if (!value?.trim()) return null;

  const image = value.trim();

  if (image.startsWith("/") && !image.startsWith("//")) {
    return image;
  }

  try {
    const parsed = new URL(image);

    if (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    ) {
      return parsed.href;
    }
  } catch {
    return null;
  }

  return null;
}

async function fetchResource(
  endpoint: string,
  signal: AbortSignal
): Promise<unknown> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

/* =====================================================
   SHARED MOTION
   Runs identically in preview and production
   ===================================================== */

function useSectionReveal<T extends HTMLElement>() {
  const sectionRef = useRef<T | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const canObserve =
      "IntersectionObserver" in window && !reducedMotion.matches;

    const getTargets = () =>
      Array.from(
        section.querySelectorAll<HTMLElement>("[data-de-reveal]")
      );

    if (!canObserve) {
      const revealAll = () => {
        getTargets().forEach((target) => {
          target.classList.add("de-reveal-visible");
        });
      };

      revealAll();

      const fallbackMutations = new MutationObserver(revealAll);
      fallbackMutations.observe(section, { childList: true, subtree: true });

      return () => {
        fallbackMutations.disconnect();
      };
    }

    const registered = new WeakSet<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;

          target.classList.add("de-reveal-visible");
          observer.unobserve(target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    const register = () => {
      getTargets().forEach((target) => {
        if (registered.has(target)) return;

        registered.add(target);

        if (!target.classList.contains("de-reveal-visible")) {
          observer.observe(target);
        }
      });
    };

    section.classList.add("de-motion-ready");
    register();

    const mutations = new MutationObserver(register);
    mutations.observe(section, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);

  return sectionRef;
}

/* =====================================================
   SHARED COMPONENTS
   ===================================================== */

function DishImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const resolved = resolveImageUrl(src);
  const [failedImage, setFailedImage] = useState<string | null>(
    null
  );

  if (!resolved || failedImage === resolved) {
    return (
      <div
        className={`de-image-placeholder ${className}`}
        role="img"
        aria-label={`Photograph unavailable for ${alt}`}
      >
        <ChefHat size={36} strokeWidth={1.5} />
        <span>PHOTO COMING SOON</span>
      </div>
    );
  }

  return (
    <div className={`de-image-frame ${className}`}>
      <Image
        src={resolved}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes={
          priority
            ? "(max-width: 900px) 100vw, 48vw"
            : "(max-width: 700px) 100vw, 33vw"
        }
        className="de-food-image"
        onError={() => setFailedImage(resolved)}
      />
    </div>
  );
}

function RatingStars({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div
      className="de-rating-stars"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          fill={
            index < Math.round(rating)
              ? "currentColor"
              : "none"
          }
          strokeWidth={1.8}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function SpiceIndicator({ level }: { level: number }) {
  const safeLevel = Math.max(
    0,
    Math.min(5, Math.round(level))
  );

  const description =
    safeLevel === 0
      ? "No heat"
      : safeLevel <= 2
        ? "Mild heat"
        : safeLevel <= 4
          ? "Bringing the heat"
          : "Extra fiery";

  return (
    <div className="de-spice-indicator">
      <div className="de-spice-icons" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Flame
            key={index}
            size={20}
            className={
              index < safeLevel
                ? "de-spice-active"
                : "de-spice-inactive"
            }
          />
        ))}
      </div>

      <span>{description}</span>
      <strong>{safeLevel}/5</strong>
    </div>
  );
}

function PageMessage({
  eyebrow,
  title,
  description,
  onRetry,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <section className="de-page-message">
      <div className="de-container">
        <div className="de-message-card">
          <div className="de-message-icon">
            <Compass size={30} strokeWidth={1.5} />
          </div>

          <span className="de-eyebrow">{eyebrow}</span>

          <h1>{title}</h1>
          <p>{description}</p>

          <div className="de-message-actions">
            {onRetry && (
              <button
                type="button"
                className="de-primary-button"
                onClick={onRetry}
              >
                <RefreshCw size={17} />
                TRY AGAIN
              </button>
            )}

            <Link
              href="/search"
              className="de-secondary-button"
            >
              <ArrowLeft size={17} />
              EXPLORE FOOD
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   01 — DISH SPOTLIGHT
   ===================================================== */

export function DishSpotlight({
  dish,
  vendor,
  vendorStatus,
  averageRating,
  reviewCount,
}: {
  dish: Dish;
  vendor: Vendor | null;
  vendorStatus: ResourceStatus;
  averageRating: number | null;
  reviewCount: number;
}) {
  const sectionRef = useSectionReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="de-spotlight"
    >
      <div className="de-spotlight-orb de-orb-one" />
      <div className="de-spotlight-orb de-orb-two" />

      <div className="de-container">
        <nav
          className="de-breadcrumbs"
          aria-label="Breadcrumb"
        >
          <Link href="/">Discover</Link>
          <ArrowRight size={13} />
          <Link href="/search">Explore Food</Link>
          <ArrowRight size={13} />
          <strong>{dish.name}</strong>
        </nav>

        <div className="de-spotlight-grid">
          <div
            className="de-spotlight-copy"
            data-de-reveal
          >
            <div className="de-title-overline">
              <span className="de-overline-mark">
                <Sparkles size={15} />
              </span>
              <span>THE CRAVING LAB / DISH DISCOVERY</span>
            </div>

            <h1>{dish.name}</h1>

            <p className="de-hero-subtitle">
              A closer look at something worth craving.
            </p>

            <div className="de-dish-meta">
              <div className="de-price-wrap">
                <span className="de-small-label">
                  STARTING AT
                </span>

                <strong className="de-price">
                  {formatPrice(dish.price)}
                </strong>
              </div>

              <div className="de-rating-summary">
                <span className="de-rating-icon">
                  <Star
                    size={18}
                    fill="currentColor"
                  />
                </span>

                {averageRating !== null ? (
                  <div>
                    <strong>{averageRating.toFixed(1)}</strong>
                    <span>
                      {reviewCount}{" "}
                      {reviewCount === 1
                        ? "review"
                        : "reviews"}
                    </span>
                  </div>
                ) : (
                  <div>
                    <strong>New find</strong>
                    <span>No rating yet</span>
                  </div>
                )}
              </div>
            </div>

            <div className="de-description-block">
              <span className="de-small-label">
                WHAT MAKES IT SPECIAL
              </span>

              <p>
                {dish.description?.trim() ||
                  "More about this dish is coming soon."}
              </p>
            </div>

            <div className="de-spice-block">
              <div className="de-block-heading">
                <span className="de-block-icon">
                  <Flame size={19} />
                </span>

                <span>THE HEAT CHECK</span>
              </div>

              <SpiceIndicator level={dish.spice_level} />
            </div>

            <div className="de-spotlight-vendor-preview">
              <span className="de-preview-icon">
                <Store size={23} />
              </span>

              <div className="de-preview-content">
                <span className="de-small-label">
                  SERVED AT
                </span>

                {vendorStatus === "loading" ? (
                  <p>Finding this food spot...</p>
                ) : vendor ? (
                  <>
                    <strong>{vendor.name}</strong>
                    <span>
                      {vendor.location ||
                        "Location not available"}
                    </span>
                  </>
                ) : (
                  <p>
                    Vendor information currently unavailable.
                  </p>
                )}
              </div>

              <a
                href="#where-to-find"
                className="de-preview-arrow"
                aria-label="View vendor details"
              >
                <ArrowUpRight size={20} />
              </a>
            </div>

            <div className="de-spotlight-actions">
              <a
                href="#where-to-find"
                className="de-primary-button"
              >
                <MapPin size={18} />
                WHERE TO FIND IT
                <ArrowRight size={18} />
              </a>

              <Link
                href="/search"
                className="de-text-link"
              >
                <ArrowLeft size={17} />
                BACK TO DISCOVERY
              </Link>
            </div>
          </div>

          <div
            className="de-visual-column"
            data-de-reveal
          >
            <div className="de-hero-image-shell">
              <div className="de-image-topline">
                <span>
                  <Sparkles size={15} />
                  FRESHLY DISCOVERED
                </span>

                <span>01 / 04</span>
              </div>

              <DishImage
                src={dish.image_url}
                alt={dish.name}
                className="de-main-photo"
                priority
              />

              <div className="de-image-bottomline">
                <span>
                  <Heart size={15} />
                  MADE FOR FOOD LOVERS
                </span>

                <MoveUpRight size={19} />
              </div>
            </div>

            <div className="de-photo-caption">
              <div>
                <span className="de-caption-line" />
                <p>Good food. Better discoveries.</p>
              </div>

              <span>CHEAT MEAL FINDER ©</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   02 — VENDOR
   ===================================================== */

export function VendorSection({
  vendor,
  status,
  onRetry,
}: {
  vendor: Vendor | null;
  status: ResourceStatus;
  onRetry: () => void;
}) {
  const sectionRef = useSectionReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      id="where-to-find"
      className="de-vendor-section"
    >
      <div className="de-container">
        <div
          className="de-section-heading"
          data-de-reveal
        >
          <div>
            <span className="de-eyebrow">
              <Navigation size={16} />
              02 / THE FOOD TRAIL
            </span>

            <h2>
              GREAT TASTE.
              <br />
              <em>REAL PLACES.</em>
            </h2>
          </div>

          <p>
            Found your craving? Now discover the spot
            behind it.
          </p>
        </div>

        <div
          className="de-vendor-card"
          data-de-reveal
        >
          <div className="de-vendor-card-main">
            <div className="de-vendor-icon">
              <Store size={30} strokeWidth={1.6} />
            </div>

            {status === "loading" ? (
              <div className="de-vendor-unavailable">
                <span className="de-small-label">
                  LOCATING THE GOOD STUFF
                </span>

                <h3>Finding this food spot...</h3>
              </div>
            ) : vendor ? (
              <div className="de-vendor-information">
                <span className="de-small-label">
                  YOUR NEXT FOOD STOP
                </span>

                <h3>{vendor.name}</h3>

                <Link
                  href={`/vendors/${vendor.vendor_id}`}
                  className="de-text-link"
                >
                  View vendor details
                  <ArrowRight size={17} />
                </Link>

                <span className="de-vendor-type">
                  <BadgeCheck size={15} />
                  {formatVendorType(vendor.vendor_type)}
                </span>
              </div>
            ) : (
              <div className="de-vendor-unavailable">
                <span className="de-small-label">
                  FOOD SPOT UNAVAILABLE
                </span>

                <h3>We couldn&apos;t find this vendor.</h3>

                <button
                  type="button"
                  onClick={onRetry}
                  className="de-inline-retry"
                >
                  <RefreshCw size={15} />
                  TRY AGAIN
                </button>
              </div>
            )}
          </div>

          {vendor && (
            <div className="de-vendor-details">
              <div className="de-vendor-detail">
                <span className="de-detail-icon de-location-icon">
                  <MapPin size={23} />
                </span>

                <div>
                  <span>LOCATION</span>

                  <strong>
                    {vendor.location ||
                      "Location not available"}
                  </strong>
                </div>
              </div>

              <div className="de-vendor-detail">
                <span className="de-detail-icon de-hours-icon">
                  <Clock3 size={23} />
                </span>

                <div>
                  <span>OPENING HOURS</span>

                  <strong>
                    {vendor.opening_hours ||
                      "Hours not available"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="de-vendor-card-footer">
            <span>
              <Compass size={16} />
              LOCAL FOOD, WORTH DISCOVERING
            </span>

            <Link href="/search">
              EXPLORE MORE SPOTS
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   03 — REVIEWS
   ===================================================== */

export function ReviewsSection({
  dishId,
  reviews,
  status,
  onRetry,
}: {
  dishId?: number;
  reviews: Review[];
  status: ResourceStatus;
  onRetry: () => void;
}) {
  const sectionRef = useSectionReveal<HTMLElement>();

  const average =
    reviews.length > 0
      ? reviews.reduce(
        (total, review) => total + review.rating,
        0
      ) / reviews.length
      : null;

  return (
    <section
      ref={sectionRef}
      className="de-reviews-section"
    >
      <div className="de-container">
        <div
          className="de-section-heading"
          data-de-reveal
        >
          <div>
            <span className="de-eyebrow">
              <MessageCircle size={16} />
              03 / THE TASTE VERDICT
            </span>

            <h2>
              THE PEOPLE
              <br />
              <em>HAVE TASTED.</em>
            </h2>
          </div>

          <p>
            Straight from the food community.
            Real ratings, genuine experiences.
          </p>
        </div>

        {status === "loading" ? (
          <div className="de-reviews-state" data-de-reveal>
            <Star size={29} />
            <h3>Gathering community reviews...</h3>
            <p>Finding out what food lovers think.</p>
          </div>
        ) : status === "error" ? (
          <div className="de-reviews-state" data-de-reveal>
            <Star size={29} />
            <h3>Reviews are taking a moment.</h3>

            <p>
              We couldn&apos;t load the community feedback.
            </p>

            <button
              type="button"
              onClick={onRetry}
              className="de-secondary-button"
            >
              <RefreshCw size={16} />
              TRY AGAIN
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="de-reviews-state" data-de-reveal>
            <MessageCircle size={30} />

            <span className="de-small-label">
              THE CONVERSATION STARTS HERE
            </span>

            <h3>No reviews just yet.</h3>

            <p>
              This dish hasn&apos;t received any public
              reviews yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="de-reviews-layout">
            <aside
              className="de-rating-panel"
              data-de-reveal
            >
              <span className="de-small-label">
                COMMUNITY SCORE
              </span>

              <div className="de-rating-score">
                <strong className="de-rating-number">
                  {average?.toFixed(1)}
                </strong>

                <span>/ 5.0</span>
              </div>

              {average !== null && (
                <RatingStars rating={average} size={22} />
              )}

              <p>
                Based on {reviews.length}{" "}
                {reviews.length === 1
                  ? "public review"
                  : "public reviews"}
              </p>

              <div className="de-rating-note">
                <ShieldCheck size={19} />

                <span>
                  From genuine community ratings
                </span>
              </div>
            </aside>

            <div className="de-review-list">
              {reviews.map((review) => (
                <article
                  key={review.review_id}
                  className="de-review-card"
                  data-de-reveal
                >
                  <div className="de-review-card-top">
                    <RatingStars rating={review.rating} />

                    <time dateTime={review.created_at}>
                      {formatDate(review.created_at)}
                    </time>
                  </div>

                  {review.comment?.trim() ? (
                    <p>{review.comment}</p>
                  ) : (
                    <p className="de-review-no-comment">
                      Rating shared without a written
                      review.
                    </p>
                  )}

                  <span className="de-review-footer">
                    <MessageCircle size={13} />
                    COMMUNITY REVIEW
                  </span>
                </article>
              ))}
            </div>
          </div>
        )}

        {dishId !== undefined && (
        <div className="de-reviews-page-link-wrap">
          <Link
            href={`/dishes/${dishId}/reviews`}
            className="de-reviews-page-link"
          >
            <MessageCircle size={19} aria-hidden="true" />
            <span>VIEW &amp; SHARE REVIEWS</span>
            <span className="de-reviews-page-link-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        )}
        <div className="de-reviews-bottom">
          <Sparkles size={15} />

          <span>
            GOOD FOOD CREATES GREAT CONVERSATIONS
          </span>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   04 — RELATED DISHES
   ===================================================== */

export function RelatedDishesSection({
  dishes,
  status,
  onRetry,
}: {
  dishes: Dish[];
  status: ResourceStatus;
  onRetry: () => void;
}) {
  const sectionRef = useSectionReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="de-related-section"
    >
      <div className="de-container">
        <div
          className="de-section-heading de-related-heading"
          data-de-reveal
        >
          <div>
            <span className="de-eyebrow">
              <Heart size={16} />
              04 / KEEP EXPLORING
            </span>

            <h2>
              ONE CRAVING
              <br />
              <em>LEADS TO ANOTHER.</em>
            </h2>

            <p className="de-related-description">
              A few more discoveries you might love.
            </p>
          </div>

          <Link
            href="/search"
            className="de-related-explore"
          >
            EXPLORE ALL DISHES
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {status === "loading" ? (
          <div className="de-related-state" data-de-reveal>
            <p>Discovering more dishes...</p>
          </div>
        ) : status === "error" ? (
          <div className="de-related-state" data-de-reveal>
            <p>
              More dishes couldn&apos;t be loaded right now.
            </p>

            <button
              type="button"
              onClick={onRetry}
              className="de-secondary-button"
            >
              <RefreshCw size={16} />
              TRY AGAIN
            </button>
          </div>
        ) : dishes.length === 0 ? (
          <div className="de-related-state" data-de-reveal>
            <h3>Every craving has its own story.</h3>

            <p>
              No related dishes are available right now,
              but there&apos;s more food to discover.
            </p>

            <Link
              href="/search"
              className="de-primary-button"
            >
              EXPLORE ALL DISHES
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="de-related-grid">
            {dishes.map((dish) => (
              <Link
                key={dish.dish_id}
                href={`/dishes/${dish.dish_id}`}
                className="de-related-card"
                data-de-reveal
              >
                <div className="de-related-card-photo">
                  <DishImage
                    src={dish.image_url}
                    alt={dish.name}
                    className="de-related-image"
                  />

                  <span className="de-related-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </div>

                <div className="de-related-card-copy">
                  <span className="de-small-label">
                    ANOTHER GOOD FIND
                  </span>

                  <h3>{dish.name}</h3>

                  <div className="de-related-card-footer">
                    <strong>
                      {formatPrice(dish.price)}
                    </strong>

                    <span>
                      <Flame size={16} />
                      {Math.max(
                        0,
                        Math.min(
                          5,
                          Math.round(dish.spice_level)
                        )
                      )}
                      /5
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div
          className="de-final-discovery"
          data-de-reveal
        >
          <div className="de-final-icon">
            <Compass size={28} />
          </div>

          <div>
            <span>THE DISCOVERY NEVER ENDS</span>
            <h3>Still got room for one more?</h3>
            <p>
              There&apos;s always something delicious
              waiting around the corner.
            </p>
          </div>

          <Link href="/search">
            KEEP EXPLORING
            <ArrowRight size={19} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   PRODUCTION PAGE — API DATA ONLY
   ===================================================== */

export default function DishDetailsExperience() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;

  const dishId = Number(rawId);

  const validDishId =
    typeof rawId === "string" &&
    /^\d+$/.test(rawId) &&
    Number.isSafeInteger(dishId) &&
    dishId > 0;

  const [dish, setDish] = useState<Dish | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedDishes, setRelatedDishes] = useState<Dish[]>(
    []
  );

  const [dishStatus, setDishStatus] =
    useState<LoadStatus>("loading");

  const [vendorStatus, setVendorStatus] =
    useState<ResourceStatus>("loading");

  const [reviewsStatus, setReviewsStatus] =
    useState<ResourceStatus>("loading");

  const [relatedStatus, setRelatedStatus] =
    useState<ResourceStatus>("loading");

  const [retryKey, setRetryKey] = useState(0);
  const [vendorRetryKey, setVendorRetryKey] = useState(0);
  const [reviewsRetryKey, setReviewsRetryKey] = useState(0);
  const [relatedRetryKey, setRelatedRetryKey] = useState(0);

  const retryDish = useCallback(() => {
    setDishStatus("loading");
    setRetryKey((current) => current + 1);
  }, []);

  const retryVendor = useCallback(() => {
    setVendorStatus("loading");
    setVendorRetryKey((current) => current + 1);
  }, []);

  const retryReviews = useCallback(() => {
    setReviewsStatus("loading");
    setReviewsRetryKey((current) => current + 1);
  }, []);

  const retryRelated = useCallback(() => {
    setRelatedStatus("loading");
    setRelatedRetryKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!validDishId || !API_URL) return;

    const controller = new AbortController();

    const loadDish = async () => {
      try {
        const response = await fetch(
          `${API_URL}/dishes/${dishId}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (response.status === 404) {
          if (!controller.signal.aborted) {
            setDish(null);
            setDishStatus("not-found");
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Dish request failed: ${response.status}`
          );
        }

        const data: unknown = await response.json();
        const parsedDish = parseDish(data);

        if (!parsedDish || parsedDish.dish_id !== dishId) {
          throw new Error("Invalid dish response");
        }

        if (!controller.signal.aborted) {
          setDish(parsedDish);
          setDishStatus("success");
        }
      } catch {
        if (!controller.signal.aborted) {
          setDish(null);
          setDishStatus("error");
        }
      }
    };

    void loadDish();

    return () => controller.abort();
  }, [dishId, validDishId, retryKey]);

  useEffect(() => {
    if (!dish || !API_URL) return;

    const controller = new AbortController();

    const loadVendor = async () => {
      try {
        const data = await fetchResource(
          `/vendors/${dish.vendor_id}`,
          controller.signal
        );

        const parsedVendor = parseVendor(data);

        if (
          !parsedVendor ||
          parsedVendor.vendor_id !== dish.vendor_id
        ) {
          throw new Error("Invalid vendor response");
        }

        if (!controller.signal.aborted) {
          setVendor(parsedVendor);
          setVendorStatus("success");
        }
      } catch {
        if (!controller.signal.aborted) {
          setVendor(null);
          setVendorStatus("error");
        }
      }
    };

    void loadVendor();

    return () => controller.abort();
  }, [dish, vendorRetryKey]);

  useEffect(() => {
    if (!dish || !API_URL) return;

    const controller = new AbortController();

    const loadReviews = async () => {
      try {
        const data = await fetchResource(
          `/reviews/dish/${dish.dish_id}`,
          controller.signal
        );

        if (!Array.isArray(data)) {
          throw new Error("Invalid reviews response");
        }

        const publicReviews = data
          .filter(isReview)
          .filter(
            (review) =>
              review.dish_id === dish.dish_id &&
              review.is_flagged === false
          );

        if (!controller.signal.aborted) {
          setReviews(publicReviews);
          setReviewsStatus("success");
        }
      } catch {
        if (!controller.signal.aborted) {
          setReviews([]);
          setReviewsStatus("error");
        }
      }
    };

    void loadReviews();

    return () => controller.abort();
  }, [dish, reviewsRetryKey]);

  useEffect(() => {
    if (!dish || !API_URL) return;

    const controller = new AbortController();

    const loadRelatedDishes = async () => {
      try {
        const data = await fetchResource(
          "/dishes/",
          controller.signal
        );

        if (!Array.isArray(data)) {
          throw new Error("Invalid dishes response");
        }

        const related = data
          .map(parseDish)
          .filter((item): item is Dish => item !== null)
          .filter(
            (item) =>
              item.category_id === dish.category_id &&
              item.dish_id !== dish.dish_id
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 3);

        if (!controller.signal.aborted) {
          setRelatedDishes(related);
          setRelatedStatus("success");
        }
      } catch {
        if (!controller.signal.aborted) {
          setRelatedDishes([]);
          setRelatedStatus("error");
        }
      }
    };

    void loadRelatedDishes();

    return () => controller.abort();
  }, [dish, relatedRetryKey]);

  const publicRating = useMemo(() => {
    if (
      reviewsStatus !== "success" ||
      reviews.length === 0
    ) {
      return null;
    }

    return (
      reviews.reduce(
        (total, review) => total + review.rating,
        0
      ) / reviews.length
    );
  }, [reviews, reviewsStatus]);

  const currentDishStatus: LoadStatus = !validDishId
    ? "not-found"
    : !API_URL
      ? "unconfigured"
      : dishStatus;

  return (
    <main
      id="top"
      className="dish-edit-v1 de-craving-lab-v3 min-h-screen"
    >
      <div className="sticky top-0 z-50 -mb-[78px] sm:-mb-[86px] lg:-mb-[90px]">
        <DiscoveryNavbar />
      </div>

      {currentDishStatus === "loading" && (
        <section className="de-loading-page">
          <div className="de-container">
            <div className="de-loading-intro">
              <span className="de-eyebrow">
                <Sparkles size={16} />
                THE CRAVING LAB
              </span>

              <h1>Something delicious is loading.</h1>

              <p>
                Getting the details of your next great
                food discovery.
              </p>
            </div>

            <div
              className="de-loading-layout"
              aria-label="Loading dish details"
            >
              <div className="de-skeleton de-skeleton-photo" />

              <div className="de-loading-copy">
                <div className="de-skeleton de-skeleton-line" />
                <div className="de-skeleton de-skeleton-title" />
                <div className="de-skeleton de-skeleton-title" />
                <div className="de-skeleton de-skeleton-line" />
                <div className="de-skeleton de-skeleton-block" />
              </div>
            </div>
          </div>
        </section>
      )}

      {currentDishStatus === "unconfigured" && (
        <PageMessage
          eyebrow="DISCOVERY IS GETTING READY"
          title="The food trail is almost ready."
          description="Dish details will appear here once the backend API connection is configured."
        />
      )}

      {currentDishStatus === "not-found" && (
        <PageMessage
          eyebrow="THIS TRAIL WENT COLD"
          title="We couldn't find that dish."
          description="This dish may not exist anymore. There are plenty of other delicious discoveries waiting for you."
        />
      )}

      {currentDishStatus === "error" && (
        <PageMessage
          eyebrow="A SMALL DETOUR"
          title="We lost the food trail."
          description="We couldn't load this dish right now. Try again or explore something else."
          onRetry={retryDish}
        />
      )}

      {currentDishStatus === "success" && dish && (
        <>
          <DishSpotlight
            dish={dish}
            vendor={vendor}
            vendorStatus={vendorStatus}
            averageRating={publicRating}
            reviewCount={reviews.length}
          />

          <VendorSection
            vendor={vendor}
            status={vendorStatus}
            onRetry={retryVendor}
          />

          <ReviewsSection
          dishId={dish.dish_id}
            reviews={reviews}
            status={reviewsStatus}
            onRetry={retryReviews}
          />

          <RelatedDishesSection
            dishes={relatedDishes}
            status={relatedStatus}
            onRetry={retryRelated}
          />
        </>
      )}

      <DiscoveryFooter />
    </main>
  );
}
