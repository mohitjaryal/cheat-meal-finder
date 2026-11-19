"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChefHat,
  Clock3,
  MapPin,
  RefreshCw,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import DiscoveryNavbar from "@/components/discovery/DiscoveryNavbar";
import DiscoveryFooter from "@/components/discovery/DiscoveryFooter";

type Vendor = {
  vendor_id: number;
  name: string;
  location: string | null;
  opening_hours: string | null;
  vendor_type: string | null;
};

type Dish = {
  dish_id: number;
  vendor_id: number;
  name: string;
  price: number;
  description: string | null;
  spice_level: string | number | null;
};

type VendorState =
  | { status: "loading" }
  | { status: "success"; data: Vendor }
  | { status: "not-found" }
  | { status: "error" };

type DishesState =
  | { status: "loading" }
  | { status: "success"; data: Dish[] }
  | { status: "error" };

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseVendor(value: unknown, expectedId: number): Vendor | null {
  if (!isRecord(value)) return null;

  const name = optionalText(value.name);

  if (
    typeof value.vendor_id !== "number" ||
    value.vendor_id !== expectedId ||
    !name
  ) {
    return null;
  }

  return {
    vendor_id: value.vendor_id,
    name,
    location: optionalText(value.location),
    opening_hours: optionalText(value.opening_hours),
    vendor_type: optionalText(value.vendor_type),
  };
}

function parseDish(value: unknown, expectedVendorId: number): Dish | null {
  if (!isRecord(value)) return null;

  const name = optionalText(value.name);
  const price =
    typeof value.price === "number"
      ? value.price
      : typeof value.price === "string" && value.price.trim()
        ? Number(value.price)
        : Number.NaN;

  if (
    typeof value.dish_id !== "number" ||
    !Number.isSafeInteger(value.dish_id) ||
    value.dish_id <= 0 ||
    value.vendor_id !== expectedVendorId ||
    !name ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return null;
  }

  const spice =
    typeof value.spice_level === "string" ||
    (typeof value.spice_level === "number" &&
      Number.isFinite(value.spice_level))
      ? value.spice_level
      : null;

  return {
    dish_id: value.dish_id,
    vendor_id: expectedVendorId,
    name,
    price,
    description: optionalText(value.description),
    spice_level: spice,
  };
}

function formatVendorType(value: string | null): string {
  if (!value) return "Food spot";

  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatSpice(value: string | number | null): string | null {
  if (typeof value === "string") {
    const text = value.trim();
    return text ? `Spice: ${text}` : null;
  }

  return value !== null ? `Spice level: ${value}` : null;
}

export default function VendorDetailsPage() {
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const vendorId =
    typeof rawId === "string" && /^\d+$/.test(rawId)
      ? Number(rawId)
      : Number.NaN;
  const validId = Number.isSafeInteger(vendorId) && vendorId > 0;

  const [attempt, setAttempt] = useState(0);
  const [vendorState, setVendorState] = useState<VendorState>({
    status: "loading",
  });
  const [dishesState, setDishesState] = useState<DishesState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadPage() {
      setVendorState({ status: "loading" });
      setDishesState({ status: "loading" });

      if (!validId) {
        setVendorState({ status: "not-found" });
        return;
      }

      if (!API_URL) {
        setVendorState({ status: "error" });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/vendors/${vendorId}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (response.status === 404) {
          setVendorState({ status: "not-found" });
          return;
        }

        if (!response.ok) throw new Error("Vendor request failed");

        const vendor = parseVendor(await response.json(), vendorId);
        if (!vendor) throw new Error("Invalid vendor response");
        if (controller.signal.aborted) return;

        setVendorState({ status: "success", data: vendor });
      } catch {
        if (!controller.signal.aborted) {
          setVendorState({ status: "error" });
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/dishes/vendor/${vendorId}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("Dishes request failed");

        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid dishes response");

        const dishes = data.map((item) => parseDish(item, vendorId));

        // Do not present a malformed response as a genuine empty menu.
        if (dishes.some((dish) => dish === null)) {
          throw new Error("Invalid dish record");
        }

        if (!controller.signal.aborted) {
          setDishesState({
            status: "success",
            data: dishes.filter((dish): dish is Dish => dish !== null),
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setDishesState({ status: "error" });
        }
      }
    }

    void loadPage();
    return () => controller.abort();
  }, [vendorId, validId, attempt]);

  useEffect(() => {
    if (vendorState.status !== "success") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (
      reducedMotion.matches ||
      !("IntersectionObserver" in window) ||
      !("MutationObserver" in window) ||
      !("animate" in Element.prototype)
    ) {
      return;
    }

    const root = document.querySelector(".vendor-details");
    if (!root) return;

    const selector =
      ".vd-section-heading, .vd-info-card, .vd-dish-card, .vd-outro";

    const observed = new WeakSet<Element>();
    const animations = new Set<Animation>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          observer.unobserve(entry.target);

          const animation = entry.target.animate(
            [
              { opacity: 0.75, translate: "0 24px" },
              { opacity: 1, translate: "0 0" },
            ],
            {
              duration: 850,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            }
          );

          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
          animation.oncancel = () => animations.delete(animation);
        });
      },
      { threshold: 0.08 }
    );

    function observeTargets() {
      root?.querySelectorAll(selector).forEach((target) => {
        if (observed.has(target)) return;
        observed.add(target);
        observer.observe(target);
      });
    }

    observeTargets();

    // Dish cards can arrive after the vendor details have rendered.
    const mutations = new MutationObserver(observeTargets);
    mutations.observe(root, { childList: true, subtree: true });

    const stopForReducedMotion = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };

    reducedMotion.addEventListener("change", stopForReducedMotion);

    return () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      reducedMotion.removeEventListener("change", stopForReducedMotion);
    };
  }, [vendorState.status]);

  function retry() {
    setAttempt((current) => current + 1);
  }

  return (
    <main className="vendor-details">
      <DiscoveryNavbar />

      <div className="vd-shell">
        <nav className="vd-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Discover</Link>
          <span aria-hidden="true">/</span>
          <Link href="/search">Explore food</Link>
          <span aria-hidden="true">/</span>
          <span>Food spot</span>
        </nav>

        {vendorState.status === "loading" && (
          <section className="vd-state" role="status">
            <span className="vd-state-icon">
              <Store size={28} aria-hidden="true" />
            </span>
            <p className="vd-kicker">FINDING YOUR SPOT</p>
            <h1>One moment, food lover.</h1>
            <p>We’re loading the latest details for this vendor.</p>
          </section>
        )}

        {vendorState.status === "not-found" && (
          <section className="vd-state">
            <span className="vd-state-icon">
              <MapPin size={28} aria-hidden="true" />
            </span>
            <p className="vd-kicker">SPOT NOT FOUND</p>
            <h1>We couldn’t find this vendor.</h1>
            <p>This food spot may no longer be available.</p>
            <Link className="vd-button" href="/search">
              Explore food <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        )}

        {vendorState.status === "error" && (
          <section className="vd-state" role="alert">
            <span className="vd-state-icon">
              <Store size={28} aria-hidden="true" />
            </span>
            <p className="vd-kicker">SOMETHING WENT WRONG</p>
            <h1>We couldn’t load this spot.</h1>
            <p>Please try again in a moment.</p>
            <button className="vd-button" type="button" onClick={retry}>
              <RefreshCw size={18} aria-hidden="true" /> Try again
            </button>
          </section>
        )}

        {vendorState.status === "success" && (
          <>
            <section className="vd-hero">
              <div className="vd-hero-copy">
                <p className="vd-kicker">
                  <span className="vd-kicker-dot" aria-hidden="true" />
                  THE FOOD SPOT EDIT
                </p>
                <h1>{vendorState.data.name}</h1>
                <p className="vd-hero-intro">
                  Good food has a place. Discover what’s being served here.
                </p>
                <div className="vd-hero-tags">
                  <span>
                    <MapPin size={16} aria-hidden="true" />
                    {vendorState.data.location || "Location not available"}
                  </span>
                  <span>
                    <Store size={16} aria-hidden="true" />
                    {formatVendorType(vendorState.data.vendor_type)}
                  </span>
                </div>
                <a className="vd-button" href="#vendor-dishes">
                  Explore the dishes
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              </div>

              <div className="vd-hero-art" aria-hidden="true">
                <div className="vd-art-ring vd-art-ring-one" />
                <div className="vd-art-ring vd-art-ring-two" />
                <div className="vd-art-center">
                  <Store size={54} strokeWidth={1.4} />
                </div>
                <span className="vd-art-label">A PLACE WORTH DISCOVERING</span>
              </div>
            </section>

            <section className="vd-visit" aria-labelledby="vd-visit-title">
              <div className="vd-section-heading">
                <div>
                  <p className="vd-kicker">THE DETAILS</p>
                  <h2 id="vd-visit-title">Get to know the spot.</h2>
                </div>
                <p>Just the essentials, straight from the listing.</p>
              </div>

              <div className="vd-info-grid">
                <article className="vd-info-card">
                  <span className="vd-info-icon">
                    <MapPin size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Location</h3>
                    <p>{vendorState.data.location || "Location not available"}</p>
                  </div>
                </article>
                <article className="vd-info-card">
                  <span className="vd-info-icon">
                    <Clock3 size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Opening hours</h3>
                    <p>
                      {vendorState.data.opening_hours || "Hours not available"}
                    </p>
                  </div>
                </article>
                <article className="vd-info-card">
                  <span className="vd-info-icon">
                    <Store size={21} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>Spot type</h3>
                    <p>
                      {vendorState.data.vendor_type
                        ? formatVendorType(vendorState.data.vendor_type)
                        : "Type not available"}
                    </p>
                  </div>
                </article>
              </div>
            </section>

            <section
              id="vendor-dishes"
              className="vd-dishes"
              aria-labelledby="vd-dishes-title"
            >
              <div className="vd-section-heading">
                <div>
                  <p className="vd-kicker">FROM THIS SPOT</p>
                  <h2 id="vd-dishes-title">What’s on the table.</h2>
                </div>
                <p>Explore dishes listed for {vendorState.data.name}.</p>
              </div>

              {dishesState.status === "loading" && (
                <div className="vd-dishes-state" role="status">
                  Finding dishes at this spot…
                </div>
              )}

              {dishesState.status === "error" && (
                <div className="vd-dishes-state" role="alert">
                  <p>We couldn’t load the dishes right now.</p>
                  <button
                    className="vd-secondary-button"
                    type="button"
                    onClick={retry}
                  >
                    <RefreshCw size={16} aria-hidden="true" /> Try again
                  </button>
                </div>
              )}

              {dishesState.status === "success" &&
                dishesState.data.length === 0 && (
                  <div className="vd-dishes-state">
                    <ChefHat size={26} aria-hidden="true" />
                    <p>No dishes are listed for this spot yet.</p>
                  </div>
                )}

              {dishesState.status === "success" &&
                dishesState.data.length > 0 && (
                  <div className="vd-dish-grid">
                    {dishesState.data.map((dish) => {
                      const spice = formatSpice(dish.spice_level);

                      return (
                        <article className="vd-dish-card" key={dish.dish_id}>
                          <Link
                            className="vd-dish-link"
                            href={`/dishes/${dish.dish_id}`}
                          >
                            <div className="vd-dish-top">
                              <span className="vd-dish-icon">
                                <UtensilsCrossed size={22} aria-hidden="true" />
                              </span>
                              <span className="vd-dish-arrow">
                                <ArrowUpRight size={20} aria-hidden="true" />
                              </span>
                            </div>
                            <div className="vd-dish-content">
                              <p className="vd-dish-label">DISH DISCOVERY</p>
                              <h3>{dish.name}</h3>
                              {dish.description && <p>{dish.description}</p>}
                            </div>
                            <div className="vd-dish-bottom">
                              <strong>{formatPrice(dish.price)}</strong>
                              {spice && <span>{spice}</span>}
                            </div>
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                )}
            </section>

            <section className="vd-outro">
              <div>
                <p className="vd-kicker">KEEP DISCOVERING</p>
                <h2>There’s always another craving.</h2>
                <p>Find more food spots and dishes worth exploring.</p>
              </div>
              <Link className="vd-button" href="/search">
                <ArrowLeft size={18} aria-hidden="true" />
                Back to discovery
              </Link>
            </section>
          </>
        )}
      </div>

      <DiscoveryFooter />
    </main>
  );
}