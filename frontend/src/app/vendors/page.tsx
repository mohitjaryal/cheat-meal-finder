"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChefHat,
  ChevronDown,
  Clock3,
  Compass,
  CookingPot,
  Flame,
  MapPin,
  RefreshCw,
  Search,
  Soup,
  Sparkles,
  Store,
  Truck,
  UtensilsCrossed,
  X,
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

type VendorsState =
  | { status: "loading" }
  | { status: "success"; data: Vendor[] }
  | { status: "error" };

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseVendor(value: unknown): Vendor | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const name = optionalText(record.name);

  if (
    typeof record.vendor_id !== "number" ||
    !Number.isSafeInteger(record.vendor_id) ||
    record.vendor_id <= 0 ||
    !name
  ) {
    return null;
  }

  return {
    vendor_id: record.vendor_id,
    name,
    location: optionalText(record.location),
    opening_hours: optionalText(record.opening_hours),
    vendor_type: optionalText(record.vendor_type),
  };
}

function formatVendorType(value: string | null): string {
  if (!value) return "Type not available";

  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function VendorIcon({
  type,
  vendorId,
}: {
  type: string | null;
  vendorId: number;
}) {
  const normalized = type?.toLowerCase().replace(/[\s-]+/g, "_");

  if (normalized === "food_truck") {
    return <Truck size={25} aria-hidden="true" />;
  }

  if (normalized === "restaurant") {
    return <UtensilsCrossed size={25} aria-hidden="true" />;
  }

  if (normalized === "street_stall") {
    const icons = [CookingPot, ChefHat, Soup, Flame];
    const Icon = icons[vendorId % icons.length];
    return <Icon size={25} aria-hidden="true" />;
  }

  return <Store size={25} aria-hidden="true" />;
}

function SpotTypeIcon({ type }: { type: string }) {
  const normalized = type.toLowerCase().replace(/[\s-]+/g, "_");

  if (normalized === "food_truck") {
    return <Truck size={17} aria-hidden="true" />;
  }

  if (normalized === "restaurant") {
    return <UtensilsCrossed size={17} aria-hidden="true" />;
  }

  if (normalized === "street_stall") {
    return <CookingPot size={17} aria-hidden="true" />;
  }

  return <Store size={17} aria-hidden="true" />;
}

export default function VendorListingsPage() {
  const [state, setState] = useState<VendorsState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVendors() {
      setState({ status: "loading" });

      if (!API_URL) {
        setState({ status: "error" });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/vendors`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Vendors request failed");

        const data: unknown = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid vendors response");
        }

        const parsed = data.map(parseVendor);

        if (parsed.some((vendor) => vendor === null)) {
          throw new Error("Invalid vendor record");
        }

        const validVendors = parsed.filter(
          (vendor): vendor is Vendor => vendor !== null
        );

        if (
          new Set(validVendors.map((vendor) => vendor.vendor_id)).size !==
          validVendors.length
        ) {
          throw new Error("Duplicate vendor IDs");
        }

        if (!controller.signal.aborted) {
          setState({ status: "success", data: validVendors });
        }
      } catch {
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      }
    }

    void loadVendors();

    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
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

    const root = document.querySelector(".vendor-listing");

    if (!root) return;

    const selector =
      ".vl-section-heading, .vl-filters, .vl-card, .vl-state, .vl-outro";

    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          observer.unobserve(entry.target);

          const isCard = entry.target.classList.contains("vl-card");
          const siblings =
            isCard && entry.target.parentElement
              ? Array.from(entry.target.parentElement.children)
              : [];

          const position = isCard ? siblings.indexOf(entry.target) : 0;
          const delay = isCard ? (Math.max(position, 0) % 3) * 110 : 0;

          const animation = entry.target.animate(
            [
              { opacity: 0.72, translate: "0 30px" },
              { opacity: 1, translate: "0 0" },
            ],
            {
              duration: 1150,
              delay,
              fill: "backwards",
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            }
          );

          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
          animation.oncancel = () => animations.delete(animation);
        });
      },
      {
        threshold: 0,
        rootMargin: "0px 0px 120px 0px",
      }
    );

    function observeTargets() {
      root?.querySelectorAll(selector).forEach((target) => {
        if (seen.has(target)) return;

        seen.add(target);
        observer.observe(target);
      });
    }

    observeTargets();

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
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const dropdown = dropdownRef.current;

      if (
        dropdown?.open &&
        event.target instanceof Node &&
        !dropdown.contains(event.target)
      ) {
        dropdown.open = false;
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && dropdownRef.current?.open) {
        event.preventDefault();
        dropdownRef.current.open = false;
        summaryRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const vendors = useMemo(
    () => (state.status === "success" ? state.data : []),
    [state]
  );

  const types = useMemo(() => {
    return Array.from(
      new Set(
        vendors
          .map((vendor) => vendor.vendor_type)
          .filter((type): type is string => type !== null)
      )
    ).sort((a, b) => formatVendorType(a).localeCompare(formatVendorType(b)));
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();

    return vendors.filter((vendor) => {
      const matchesType = !selectedType || vendor.vendor_type === selectedType;

      const searchable = [
        vendor.name,
        vendor.location,
        vendor.vendor_type,
        formatVendorType(vendor.vendor_type),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return matchesType && (!search || searchable.includes(search));
    });
  }, [vendors, query, selectedType]);

  function selectType(type: string) {
    setSelectedType(type);

    if (dropdownRef.current) {
      dropdownRef.current.open = false;
    }

    summaryRef.current?.focus();
  }

  function clearFilters() {
    setQuery("");
    setSelectedType("");

    if (dropdownRef.current) {
      dropdownRef.current.open = false;
    }
  }

  return (
    <main className="vendor-listing">
      <DiscoveryNavbar />

      <div className="vl-shell">
        <nav className="vl-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Discover</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Food spots</span>
        </nav>

        <section className="vl-hero" aria-labelledby="vl-title">
          <div className="vl-hero-copy">
            <p className="vl-kicker">
              <span aria-hidden="true" />
              THE FOOD SPOT EDIT
            </p>

            <h1 id="vl-title">
              Find the spot.
              <br />
              <em>Follow the craving.</em>
            </h1>

            <p className="vl-hero-intro">
              Discover the places behind your next favorite bite. Explore food
              spots and get to know what makes each one worth a visit.
            </p>

            <a className="vl-primary-button" href="#vl-discover">
              Explore food spots
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>

          <div className="vl-hero-art" aria-hidden="true">
            <div className="vl-art-glow" />
            <div className="vl-art-frame vl-art-frame-back" />

            <div className="vl-art-frame vl-art-frame-front">
              <div className="vl-art-frame-top">
                <span>THE DISCOVERY EDIT</span>
                <Sparkles size={18} />
              </div>

              <div className="vl-art-compass">
                <Compass size={88} strokeWidth={1.1} />
              </div>

              <div className="vl-art-frame-bottom">
                <span>GOOD FOOD</span>
                <strong>GREAT FINDS.</strong>
              </div>
            </div>

            <div className="vl-art-floating">
              <CookingPot size={19} />
              <span>MADE FOR DISCOVERY</span>
            </div>
          </div>
        </section>

        <section
          id="vl-discover"
          className="vl-discover"
          aria-labelledby="vl-discover-title"
        >
          <div className="vl-section-heading">
            <div>
              <p className="vl-eyebrow">EXPLORE THE COLLECTION</p>
              <h2 id="vl-discover-title">Your next food spot awaits.</h2>
            </div>

            <p>Search by name or location, or explore by spot type.</p>
          </div>

          <div className="vl-filters">
            <div className="vl-field vl-search-field">
              <label htmlFor="vl-search">Search food spots</label>

              <div className="vl-input-wrap">
                <Search size={19} aria-hidden="true" />
                <input
                  id="vl-search"
                  type="search"
                  placeholder="Try a name or location"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="vl-field vl-type-field">
              <span className="vl-field-label" id="vl-type-label">
                Spot type
              </span>

              <details className="vl-dropdown" ref={dropdownRef}>
                <summary
                  className="vl-dropdown-trigger"
                  ref={summaryRef}
                  aria-labelledby="vl-type-label vl-current-type"
                >
                  <span className="vl-dropdown-trigger-text">
                    <span className="vl-dropdown-trigger-icon">
                      <Store size={17} aria-hidden="true" />
                    </span>

                    <span id="vl-current-type">
                      {selectedType
                        ? formatVendorType(selectedType)
                        : "All spot types"}
                    </span>
                  </span>

                  <ChevronDown
                    className="vl-dropdown-chevron"
                    size={18}
                    aria-hidden="true"
                  />
                </summary>

                <div className="vl-dropdown-panel">
                  <p className="vl-dropdown-caption">EXPLORE BY TYPE</p>

                  <div
                    className="vl-dropdown-options"
                    role="group"
                    aria-label="Choose spot type"
                  >
                    <button
                      className="vl-dropdown-option"
                      type="button"
                      aria-pressed={selectedType === ""}
                      onClick={() => selectType("")}
                    >
                      <span className="vl-option-icon">
                        <Compass size={17} aria-hidden="true" />
                      </span>
                      <span className="vl-option-name">All spot types</span>
                      {selectedType === "" && (
                        <Check size={17} aria-hidden="true" />
                      )}
                    </button>

                    {types.map((type) => (
                      <button
                        className="vl-dropdown-option"
                        type="button"
                        key={type}
                        aria-pressed={selectedType === type}
                        onClick={() => selectType(type)}
                      >
                        <span className="vl-option-icon">
                          <SpotTypeIcon type={type} />
                        </span>

                        <span className="vl-option-name">
                          {formatVendorType(type)}
                        </span>

                        {selectedType === type && (
                          <Check size={17} aria-hidden="true" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </details>
            </div>

            {(query || selectedType) && (
              <button
                className="vl-clear-button"
                type="button"
                onClick={clearFilters}
              >
                <X size={16} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>

          {state.status === "loading" && (
            <div className="vl-state" role="status">
              <span className="vl-state-icon">
                <Store size={26} aria-hidden="true" />
              </span>
              <h3>Finding food spots...</h3>
              <p>We are loading the latest listings.</p>
            </div>
          )}

          {state.status === "error" && (
            <div className="vl-state" role="alert">
              <span className="vl-state-icon">
                <Store size={26} aria-hidden="true" />
              </span>
              <h3>We could not load food spots.</h3>
              <p>Please try again in a moment.</p>

              <button
                className="vl-primary-button"
                type="button"
                onClick={() => setAttempt((current) => current + 1)}
              >
                <RefreshCw size={17} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {state.status === "success" && (
            <>
              <p className="vl-results" role="status" aria-live="polite">
                {filteredVendors.length}{" "}
                {filteredVendors.length === 1 ? "food spot" : "food spots"}
                {query.trim() || selectedType ? " found" : " to explore"}
              </p>

              {vendors.length === 0 ? (
                <div className="vl-state">
                  <span className="vl-state-icon">
                    <Store size={26} aria-hidden="true" />
                  </span>
                  <h3>No food spots listed yet.</h3>
                  <p>Check back later to see what is new.</p>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="vl-state">
                  <span className="vl-state-icon">
                    <Search size={26} aria-hidden="true" />
                  </span>
                  <h3>No spots match your search.</h3>
                  <p>Try another search or clear your filters.</p>

                  <button
                    className="vl-secondary-button"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="vl-grid">
                  {filteredVendors.map((vendor) => (
                    <article className="vl-card" key={vendor.vendor_id}>
                      <Link
                        className="vl-card-link"
                        href={`/vendors/${vendor.vendor_id}`}
                      >
                        <div className="vl-card-top">
                          <span className="vl-card-icon">
                            <VendorIcon
                              type={vendor.vendor_type}
                              vendorId={vendor.vendor_id}
                            />
                          </span>

                          <span className="vl-card-arrow">
                            <ArrowUpRight size={20} aria-hidden="true" />
                          </span>
                        </div>

                        <div className="vl-card-content">
                          <p className="vl-card-type">
                            {formatVendorType(vendor.vendor_type)}
                          </p>
                          <h3>{vendor.name}</h3>
                        </div>

                        <div className="vl-card-details">
                          <p>
                            <MapPin size={16} aria-hidden="true" />
                            <span>
                              {vendor.location || "Location not available"}
                            </span>
                          </p>

                          <p>
                            <Clock3 size={16} aria-hidden="true" />
                            <span>
                              {vendor.opening_hours || "Hours not available"}
                            </span>
                          </p>
                        </div>

                        <div className="vl-card-bottom">
                          <span>Explore this spot</span>
                          <ArrowRight size={17} aria-hidden="true" />
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <section className="vl-outro">
          <div>
            <p className="vl-eyebrow">MORE TO DISCOVER</p>
            <h2>Still chasing a craving?</h2>
            <p>Explore dishes and find something that hits the spot.</p>
          </div>

          <Link className="vl-primary-button" href="/search">
            Explore dishes
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <DiscoveryFooter />
    </main>
  );
}