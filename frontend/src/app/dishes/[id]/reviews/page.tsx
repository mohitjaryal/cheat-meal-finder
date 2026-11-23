"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import DiscoveryNavbar from "@/components/discovery/DiscoveryNavbar";
import DiscoveryFooter from "@/components/discovery/DiscoveryFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const TOKEN_KEY = "cmf_access_token";

type Dish = {
  dish_id: number;
  name: string;
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

type LoadState =
  | { status: "loading" }
  | { status: "ready"; dish: Dish; reviews: Review[] }
  | { status: "not-found" }
  | { status: "error"; message: string };

type SessionState =
  | "checking"
  | "signed-out"
  | "expired"
  | "verified"
  | "error";

function isPositiveId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function parseDish(value: unknown, expectedId: number): Dish | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  if (
    !isPositiveId(record.dish_id) ||
    record.dish_id !== expectedId ||
    typeof record.name !== "string" ||
    !record.name.trim()
  ) {
    return null;
  }

  return {
    dish_id: record.dish_id,
    name: record.name,
  };
}

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    isPositiveId(record.review_id) &&
    isPositiveId(record.dish_id) &&
    isPositiveId(record.user_id) &&
    typeof record.rating === "number" &&
    Number.isInteger(record.rating) &&
    record.rating >= 1 &&
    record.rating <= 5 &&
    (record.comment === null || typeof record.comment === "string") &&
    typeof record.created_at === "string" &&
    typeof record.is_flagged === "boolean"
  );
}

function readToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-amber-500"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={17}
          fill={index < rating ? "currentColor" : "none"}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function DishReviewsPage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;

  return <ReviewsExperience key={rawId ?? "invalid"} rawId={rawId} />;
}

function ReviewsExperience({ rawId }: { rawId: string | undefined }) {
  const dishId =
    typeof rawId === "string" && /^[1-9]\d*$/.test(rawId)
      ? Number(rawId)
      : NaN;

  const validDishId = Number.isSafeInteger(dishId) && dishId > 0;

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [session, setSession] = useState<SessionState>("checking");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);
  const sessionRequestRef = useRef<AbortController | null>(null);
  const verifiedTokenRef = useRef<string | null>(null);

  const checkSession = useCallback(async () => {
    sessionRequestRef.current?.abort();

    const controller = new AbortController();
    sessionRequestRef.current = controller;
    verifiedTokenRef.current = null;

    const token = readToken();

    if (!token) {
      setSession("signed-out");
      return;
    }

    if (!API_URL) {
      setSession("error");
      return;
    }

    setSession("checking");

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      if (readToken() !== token) {
        setSession("error");
        return;
      }

      if (response.status === 401) {
        setSession("expired");
        return;
      }

      if (!response.ok) {
        setSession("error");
        return;
      }

      const data: unknown = await response.json();

      if (controller.signal.aborted) return;

      if (readToken() !== token) {
        setSession("error");
        return;
      }

      if (
        !data ||
        typeof data !== "object" ||
        !isPositiveId((data as Record<string, unknown>).user_id)
      ) {
        setSession("error");
        return;
      }

      verifiedTokenRef.current = token;
      setSession("verified");
    } catch {
      if (!controller.signal.aborted) {
        setSession("error");
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkSession();
    }, 0);

    const handleFocus = () => {
      void checkSession();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", handleFocus);
      sessionRequestRef.current?.abort();
    };
  }, [checkSession]);

  useEffect(() => {
    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      if (!validDishId) {
        setState({ status: "not-found" });
        return;
      }

      if (!API_URL) {
        setState({
          status: "error",
          message: "The API URL is not configured.",
        });
        return;
      }

      async function loadPage() {
        setState({ status: "loading" });

        try {
          const dishResponse = await fetch(`${API_URL}/dishes/${dishId}`, {
            signal: controller.signal,
            cache: "no-store",
          });

          if (dishResponse.status === 404) {
            if (!controller.signal.aborted) {
              setState({ status: "not-found" });
            }
            return;
          }

          if (!dishResponse.ok) throw new Error("Dish request failed");

          const dish = parseDish(await dishResponse.json(), dishId);
          if (!dish) throw new Error("Invalid dish response");

          const reviewsResponse = await fetch(
            `${API_URL}/reviews/dish/${dishId}`,
            {
              signal: controller.signal,
              cache: "no-store",
            },
          );

          if (!reviewsResponse.ok) throw new Error("Reviews request failed");

          const data: unknown = await reviewsResponse.json();

          if (!Array.isArray(data)) {
            throw new Error("Invalid reviews response");
          }

          const reviews = data
            .filter(isReview)
            .filter(
              (review) =>
                review.dish_id === dishId && review.is_flagged === false,
            );

          if (!controller.signal.aborted) {
            setState({ status: "ready", dish, reviews });
          }
        } catch {
          if (!controller.signal.aborted) {
            setState({
              status: "error",
              message:
                "We couldn't load this dish and its reviews. Please try again.",
            });
          }
        }
      }

      void loadPage();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [dishId, validDishId, reloadKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      submittingRef.current ||
      state.status !== "ready" ||
      session !== "verified"
    ) {
      return;
    }

    setMessage("");

    if (!API_URL) {
      setMessage("The API URL is not configured.");
      return;
    }

    const token = readToken();

    if (!token || token !== verifiedTokenRef.current) {
      setMessage("Your session changed. Please check it again.");
      void checkSession();
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setMessage("Please select a rating from 1 to 5 stars.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dish_id: dishId,
          rating,
          comment: comment.trim() || null,
        }),
        cache: "no-store",
      });

      if (response.status === 401) {
        if (readToken() === token) {
          sessionRequestRef.current?.abort();
          verifiedTokenRef.current = null;
          setSession("expired");
          setMessage("Your session is invalid or expired. Please log in again.");
        } else {
          setMessage("Your session changed. Please check it again.");
          void checkSession();
        }
        return;
      }

      if (!response.ok) {
        setMessage("We couldn't submit your review. Please try again later.");
        return;
      }

      setRating(0);
      setComment("");
      setMessage(
        "Review submitted. Public visibility may depend on moderation.",
      );
      setReloadKey((current) => current + 1);
    } catch {
      setMessage(
        "We couldn't confirm whether your review was submitted. Check the public reviews before trying again.",
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const average =
    state.status === "ready" && state.reviews.length > 0
      ? state.reviews.reduce((sum, review) => sum + review.rating, 0) /
        state.reviews.length
      : null;

  return (
    <main className="cmf-reviews-page min-h-screen bg-slate-50 text-slate-900">
      <DiscoveryNavbar />

      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16">
          <Link
            href={validDishId ? `/dishes/${dishId}` : "/search"}
            className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-slate-600 transition hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {validDishId ? "Back to dish" : "Explore dishes"}
          </Link>

          <div className="mt-9 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-teal-800 shadow-sm">
                <Sparkles size={14} aria-hidden="true" />
                Community voices
              </span>

              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Reviews &amp; ratings
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {state.status === "ready"
                  ? `Explore public feedback for ${state.dish.name} and share your experience.`
                  : "Discover what the community has shared about this dish."}
              </p>
            </div>

            {state.status === "ready" && (
              <div className="rounded-3xl border border-white bg-white/80 px-6 py-5 shadow-lg shadow-slate-200/50 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Public reviews
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">
                  {average === null ? "—" : average.toFixed(1)}
                  <span className="ml-1 text-base font-semibold text-slate-500">
                    / 5
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {state.reviews.length}{" "}
                  {state.reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {state.status === "loading" && (
          <div
            role="status"
            className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm"
          >
            Loading dish and reviews…
          </div>
        )}

        {state.status === "not-found" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">Dish not found</h2>
            <p className="mt-2 text-slate-600">
              Check the link or explore another dish.
            </p>
            <Link
              href="/search"
              className="mt-5 inline-flex font-semibold text-teal-700 underline underline-offset-4"
            >
              Explore dishes
            </Link>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="mt-2 text-slate-600">{state.message}</p>

            {message && (
              <p role="status" className="mt-3 text-sm text-slate-700">
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {state.status === "ready" && (
          <div className="cmf-review-journey">
            <div className="cmf-review-feed">
              <div className="cmf-review-feed-heading">
                <span className="cmf-review-heading-icon">
                  <MessageCircle size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="cmf-review-eyebrow">THE COMMUNITY</p>
                  <h2>What people are sharing</h2>
                  <p>Public feedback for {state.dish.name}</p>
                </div>
                <span className="cmf-review-count">
                  {state.reviews.length}{" "}
                  {state.reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              {state.reviews.length === 0 ? (
                <div className="cmf-review-empty border-dashed">
                  <h3>No public reviews yet</h3>
                  <p>
                    Tried this dish? Your review can help the next explorer
                    decide what to try.
                  </p>
                </div>
              ) : (
                <div className="cmf-review-list">
                  {state.reviews.map((review) => (
                    <article key={review.review_id} className="cmf-review-item">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Stars rating={review.rating} />
                        <time
                          dateTime={review.created_at}
                          className="text-xs font-medium text-slate-500"
                        >
                          {formatDate(review.created_at)}
                        </time>
                      </div>
                      <p className="cmf-review-comment">
                        {review.comment?.trim()
                          ? review.comment
                          : "Rating shared without a written review."}
                      </p>
                      <p className="cmf-review-item-label">Community review</p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="cmf-review-transition">
              <span className="cmf-review-transition-line" aria-hidden="true" />
              <p>YOUR TURN</p>
              <h2>Every dish has a story.</h2>
              <p className="cmf-review-transition-copy">
                From street-side discoveries to your favourite cheat meals,
                your experience can help others find their next bite.
              </p>
              <a href="#share-review" className="cmf-review-down-link">
                <span>Share your experience</span>
                <span className="cmf-review-down-icon">
                  <ArrowDown size={18} aria-hidden="true" />
                </span>
              </a>
            </div>

            <aside
              id="share-review"
              aria-labelledby="share-review-heading"
              className="cmf-review-compose text-white"
            >
              <div className="cmf-review-compose-intro">
                <span className="cmf-review-compose-icon">
                  <Sparkles size={20} aria-hidden="true" />
                </span>
                <p className="cmf-review-compose-eyebrow">YOUR EXPERIENCE</p>
                <h2 id="share-review-heading">Share your take</h2>
                <p>
                  How was {state.dish.name}? Leave a rating and add a few
                  words if you like.
                </p>
                <span className="cmf-review-compose-note">
                  A little insight for the next food explorer.
                </span>
              </div>

              <div className="cmf-review-compose-panel">
                {session === "checking" && (
                  <div className="cmf-review-login" role="status">
                    <h3>Checking your session</h3>
                    <p>Please wait a moment.</p>
                  </div>
                )}

                {(session === "signed-out" || session === "expired") && (
                  <div className="cmf-review-login">
                    <h3>
                      {session === "expired"
                        ? "Please log in again"
                        : "Join the conversation"}
                    </h3>
                    <p>
                      {session === "expired"
                        ? "Your session is invalid or expired. Log in again, then return to this page."
                        : "Log in to share your review. After logging in, return to this page to continue."}
                    </p>
                    <Link href="/login" className="cmf-review-login-link">
                      {session === "expired" ? "Log in again" : "Log in"}
                    </Link>
                  </div>
                )}

                {session === "error" && (
                  <div className="cmf-review-login">
                    <h3>Unable to verify your session</h3>
                    <p>
                      Please check your connection and try again.
                    </p>
                    <button
                      type="button"
                      className="cmf-review-login-link"
                      onClick={() => void checkSession()}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {session === "verified" && (
                  <form className="cmf-review-form" onSubmit={handleSubmit}>
                    <fieldset disabled={submitting}>
                      <legend className="text-sm font-bold">
                        Your rating <span className="text-teal-300">*</span>
                      </legend>
                      <div className="mt-3">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <label
                            key={value}
                            className={`flex cursor-pointer items-center gap-1 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                              rating === value
                                ? "border-teal-300 bg-teal-300 text-slate-950"
                                : "border-slate-600 bg-slate-800 text-white hover:border-teal-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="rating"
                              value={value}
                              checked={rating === value}
                              onChange={() => setRating(value)}
                              required
                              className="accent-teal-600"
                            />
                            <Star size={15} aria-hidden="true" />
                            {value}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label
                        htmlFor="review-comment"
                        className="block text-sm font-bold"
                      >
                        Comment{" "}
                        <span className="font-normal text-slate-300">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        disabled={submitting}
                        rows={3}
                        placeholder="Tell others about your experience"
                        className="mt-3 w-full rounded-2xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/40 disabled:opacity-60"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full bg-teal-300 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60"
                    >
                      {submitting ? "Submitting…" : "Submit review"}
                    </button>
                  </form>
                )}

                {message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="cmf-review-message"
                  >
                    {message}
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
      </section>

      <DiscoveryFooter />
    </main>
  );
}