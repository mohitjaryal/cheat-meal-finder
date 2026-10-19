"use client";

import Image from "next/image";
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
  Blend,
  Candy,
  Check,
  ChefHat,
  Citrus,
  CookingPot,
  Flame,
  Layers,
  Milk,
  RotateCcw,
  Sparkles,
  UtensilsCrossed,
  Zap,
  Droplets,
  Heart,
  Croissant,
  type LucideIcon,
} from "lucide-react";

/* ================================================================
   STREET FRESH PREMIUM
   CRAVING COMPASS V4

   12 FLAVOR PROFILES × 20 UNIQUE DISHES

   Visual Identity:
   LIQUID TITANIUM × MOLTEN COPPER

   Motion:
   Street Fresh Motion Flow V6

   Frontend-only demo recommendations.
   No FastAPI or live database integration.
================================================================ */

type FlavorId =
  | "spicy"
  | "cheesy"
  | "sweet"
  | "smoky"
  | "crispy"
  | "tangy"
  | "garlicky"
  | "creamy"
  | "sweet-spicy"
  | "refreshing"
  | "buttery"
  | "savory";

type Flavor = {
  id: FlavorId;
  name: string;
  description: string;
  color: string;
  Icon: LucideIcon;
};

type Dish = {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  flavors: FlavorId[];
  spiceLevel: number;
};

type RankedDish = Dish & {
  matchCount: number;
  matchPercentage: number;
};

/* ================================================================
   12 FLAVOR PROFILES
================================================================ */

const flavors: Flavor[] = [
  {
    id: "spicy",
    name: "Spicy",
    description: "Feel the fire",
    color: "#FF9467",
    Icon: Flame,
  },
  {
    id: "cheesy",
    name: "Cheesy",
    description: "Melt into flavor",
    color: "#F5C477",
    Icon: Layers,
  },
  {
    id: "sweet",
    name: "Sweet",
    description: "Sweet indulgence",
    color: "#F5AD9C",
    Icon: Candy,
  },
  {
    id: "smoky",
    name: "Smoky",
    description: "Fire-kissed bites",
    color: "#E6A17C",
    Icon: CookingPot,
  },
  {
    id: "crispy",
    name: "Crispy",
    description: "Golden crunch",
    color: "#F0C16E",
    Icon: Zap,
  },
  {
    id: "tangy",
    name: "Tangy",
    description: "A zesty twist",
    color: "#DBDE93",
    Icon: Citrus,
  },
  {
    id: "garlicky",
    name: "Garlicky",
    description: "Bold aromatics",
    color: "#E9CBA3",
    Icon: ChefHat,
  },
  {
    id: "creamy",
    name: "Creamy",
    description: "Rich comfort",
    color: "#F0D0B2",
    Icon: Milk,
  },
  {
    id: "sweet-spicy",
    name: "Sweet & Spicy",
    description: "The perfect contrast",
    color: "#FFA58D",
    Icon: Blend,
  },
  {
    id: "refreshing",
    name: "Refreshing",
    description: "Cool & vibrant",
    color: "#A8E5C2",
    Icon: Droplets,
  },
  {
    id: "buttery",
    name: "Buttery",
    description: "Golden indulgence",
    color: "#F7D58A",
    Icon: Croissant,
  },
  {
    id: "savory",
    name: "Savory",
    description: "Deep satisfying flavor",
    color: "#D8B69B",
    Icon: Heart,
  },
];

/* ================================================================
   20 DISTINCT DEMO DISHES

   Every dish has its own accurate food image.
   Flavor tags are manually curated demo metadata.
================================================================ */

const dishes: Dish[] = [
  {
    id: 1,
    name: "Fiery Street Momos",
    category: "Street Food",
    description:
      "Juicy street-style momos bursting with fiery chilli and tangy flavor.",
    image: "/images/discovery/spicy-momos.png",
    flavors: ["spicy", "tangy", "savory"],
    spiceLevel: 5,
  },
  {
    id: 2,
    name: "Ultimate Cheese Burger",
    category: "Fast Food",
    description:
      "A juicy burger stacked with rich melted cheese and irresistible comfort.",
    image: "/images/discovery/cheesy-burger.png",
    flavors: ["cheesy", "creamy", "savory"],
    spiceLevel: 1,
  },
  {
    id: 3,
    name: "Chilli Garlic Noodles",
    category: "Indo-Chinese",
    description:
      "Wok-tossed noodles with bold garlic, fiery chilli and aromatic spices.",
    image: "/images/discovery/chilli-garlic-noodles.png",
    flavors: ["spicy", "garlicky", "savory"],
    spiceLevel: 4,
  },
  {
    id: 4,
    name: "Chocolate Waffle",
    category: "Desserts",
    description:
      "Golden waffles dressed in indulgent chocolate and sweet comfort.",
    image: "/images/discovery/chocolate-waffle.png",
    flavors: ["sweet", "crispy", "creamy"],
    spiceLevel: 0,
  },
  {
    id: 5,
    name: "Kolkata Kathi Roll",
    category: "Street Food",
    description:
      "An iconic street-style roll layered with spices and bold savory flavor.",
    image: "/images/discovery/kolkata-kathi-roll.png",
    flavors: ["spicy", "smoky", "savory"],
    spiceLevel: 3,
  },
  {
    id: 6,
    name: "Loaded Cheese Nachos",
    category: "Cheat Meals",
    description:
      "Golden crunchy nachos covered with rich, indulgent cheese.",
    image: "/images/discovery/loaded-cheesy-nachos.png",
    flavors: ["cheesy", "crispy", "creamy"],
    spiceLevel: 2,
  },
  {
    id: 7,
    name: "Loaded Masala Fries",
    category: "Fast Food",
    description:
      "Crispy golden fries packed with punchy Indian street-style masala.",
    image: "/images/discovery/loaded-masala-fries.png",
    flavors: ["crispy", "spicy", "tangy"],
    spiceLevel: 3,
  },
  {
    id: 8,
    name: "Rabri Malai Jalebi",
    category: "Desserts",
    description:
      "Golden jalebi paired with rich rabri for a classic sweet indulgence.",
    image: "/images/discovery/rabri-malai-jalebi.png",
    flavors: ["sweet", "creamy", "crispy"],
    spiceLevel: 0,
  },
  {
    id: 9,
    name: "Butter Pav Bhaji",
    category: "Street Food",
    description:
      "Soft buttery pav served with rich, aromatic and comforting bhaji.",
    image: "/images/discovery/butter-pav-bhaji.png",
    flavors: ["buttery", "garlicky", "spicy"],
    spiceLevel: 3,
  },
  {
    id: 10,
    name: "Tandoori Chicken Wings",
    category: "Cheat Meals",
    description:
      "Char-grilled wings coated in smoky tandoori spices.",
    image: "/images/discovery/tandoori-chicken-wings.png",
    flavors: ["smoky", "spicy", "savory"],
    spiceLevel: 4,
  },
  {
    id: 11,
    name: "Smoky Tandoori Paneer Tikka",
    category: "Street Food",
    description:
      "Juicy paneer cubes grilled with authentic tandoori spices and smoky char.",
    image:
      "/images/discovery/compass/smoky-tandoori-paneer-tikka.png",
    flavors: ["smoky", "spicy", "creamy"],
    spiceLevel: 3,
  },
  {
    id: 12,
    name: "Sweet Heat Wings",
    category: "Cheat Meals",
    description:
      "Sticky glazed wings balancing fiery chilli with irresistible sweetness.",
    image: "/images/discovery/compass/sweet-heat-wings.png",
    flavors: ["sweet-spicy", "smoky", "spicy"],
    spiceLevel: 4,
  },
  {
    id: 13,
    name: "Garlic Parmesan Masala Fries",
    category: "Fast Food",
    description:
      "Golden fries coated with garlic butter, parmesan and aromatic seasoning.",
    image:
      "/images/discovery/compass/garlic-parmesan-masala-fries.png",
    flavors: ["garlicky", "crispy", "cheesy", "buttery"],
    spiceLevel: 2,
  },
  {
    id: 14,
    name: "Dahi Puri Chaat",
    category: "Street Food",
    description:
      "Crispy puris filled with cooling yogurt, vibrant chutneys and tangy chaat.",
    image: "/images/discovery/compass/dahi-puri-chaat.png",
    flavors: ["refreshing", "tangy", "crispy"],
    spiceLevel: 2,
  },
  {
    id: 15,
    name: "Butter Garlic Bread",
    category: "Fast Food",
    description:
      "Golden toasted bread brushed with rich garlic butter and fragrant herbs.",
    image: "/images/discovery/compass/butter-garlic-bread.png",
    flavors: ["buttery", "garlicky", "crispy"],
    spiceLevel: 0,
  },
  {
    id: 16,
    name: "Chicken Shawarma",
    category: "Street Food",
    description:
      "Tender grilled chicken wrapped with fresh vegetables and creamy garlic sauce.",
    image: "/images/discovery/compass/chicken-shawarma.png",
    flavors: ["savory", "smoky", "creamy"],
    spiceLevel: 2,
  },
  {
    id: 17,
    name: "Crispy Chilli Chicken",
    category: "Indo-Chinese",
    description:
      "Crispy chicken tossed in glossy chilli-garlic sauce with fresh peppers.",
    image: "/images/discovery/compass/crispy-chilli-chicken.png",
    flavors: ["spicy", "crispy", "savory"],
    spiceLevel: 4,
  },
  {
    id: 18,
    name: "Honey Chilli Potato",
    category: "Indo-Chinese",
    description:
      "Golden potato fingers glazed with sticky honey chilli sauce and sesame.",
    image: "/images/discovery/compass/honey-chilli-potato.png",
    flavors: ["sweet-spicy", "crispy", "tangy"],
    spiceLevel: 3,
  },
  {
    id: 19,
    name: "Tandoori Malai Momos",
    category: "Street Food",
    description:
      "Creamy tandoori momos with gentle smoky char and fresh mint chutney.",
    image: "/images/discovery/compass/tandoori-malai-momos.png",
    flavors: ["creamy", "smoky", "savory"],
    spiceLevel: 2,
  },
  {
    id: 20,
    name: "Masala Cheese Pizza",
    category: "Fast Food",
    description:
      "A golden Indian-style pizza layered with melted cheese and colorful masala toppings.",
    image: "/images/discovery/compass/masala-cheese-pizza.png",
    flavors: ["cheesy", "savory", "spicy"],
    spiceLevel: 2,
  },
];

/* ================================================================
   FLAVOR TAG
================================================================ */

function FlavorTag({ flavorId }: { flavorId: FlavorId }) {
  const flavor = flavors.find((item) => item.id === flavorId);

  if (!flavor) return null;

  const Icon = flavor.Icon;

  return (
    <span className="compass-titanium-tag inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold">
      <Icon aria-hidden="true" size={12} strokeWidth={1.8} />
      {flavor.name}
    </span>
  );
}

/* ================================================================
   FOOD CARD
================================================================ */

function FoodCard({
  dish,
  index,
}: {
  dish: RankedDish;
  index: number;
}) {
  const cardRef = useRef<HTMLElement>(null);

  const handlePointerMove = (
    event: PointerEvent<HTMLElement>
  ) => {
    if (event.pointerType !== "mouse") return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
    ) {
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    card.style.setProperty(
      "--rotate-x",
      `${(0.5 - y) * 6}deg`
    );

    card.style.setProperty(
      "--rotate-y",
      `${(x - 0.5) * 6}deg`
    );

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

        <Image
          src={dish.image}
          alt={dish.name}
          width={420}
          height={420}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="compass-food-image relative z-10 h-[235px] w-[90%] object-contain drop-shadow-[0_24px_25px_rgba(0,0,0,0.35)] sm:h-[265px]"
        />

        <span className="compass-titanium-match absolute right-4 top-4 z-30 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-bold">
          <Sparkles aria-hidden="true" size={13} />
          {dish.matchPercentage}% MATCH
        </span>

        <span className="absolute bottom-4 left-5 z-20 font-display text-sm font-bold text-white/65">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#F0A477]">
          {dish.category}
        </p>

        <h4 className="mt-3 font-display text-xl font-bold leading-tight tracking-[-0.045em] text-[#FFF8EF] sm:text-2xl">
          {dish.name}
        </h4>

        <p className="mt-3 flex-1 text-xs leading-6 text-[#E8E4DC]/80 sm:text-sm">
          {dish.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {dish.flavors.map((flavor) => (
            <FlavorTag key={flavor} flavorId={flavor} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-5">
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

          <span
            className="font-display text-sm font-bold text-[#F5C69E]"
            aria-label={`Spice level ${dish.spiceLevel} out of 5`}
          >
            {dish.spiceLevel}/5
          </span>
        </div>
      </div>
    </article>
  );
}

/* ================================================================
   CRAVING COMPASS
================================================================ */

export default function CravingCompass() {
  const sectionRef = useRef<HTMLElement>(null);

  const [selectedFlavors, setSelectedFlavors] =
    useState<FlavorId[]>(["spicy"]);

  const [showAll, setShowAll] = useState(false);

  const toggleFlavor = (flavorId: FlavorId) => {
    setSelectedFlavors((current) => {
      if (current.includes(flavorId)) {
        return current.filter((item) => item !== flavorId);
      }

      if (current.length >= 2) {
        return [current[1], flavorId];
      }

      return [...current, flavorId];
    });

    setShowAll(false);
  };

  /* Real React filtering over manually curated demo tags. */

  const rankedDishes = useMemo<RankedDish[]>(() => {
    if (selectedFlavors.length === 0) return [];

    return dishes
      .map((dish) => {
        const matchCount = selectedFlavors.filter((flavor) =>
          dish.flavors.includes(flavor)
        ).length;

        return {
          ...dish,
          matchCount,
          matchPercentage: Math.round(
            (matchCount / selectedFlavors.length) * 100
          ),
        };
      })
      .filter((dish) => dish.matchCount > 0)
      .sort(
        (a, b) =>
          b.matchCount - a.matchCount ||
          a.name.localeCompare(b.name)
      );
  }, [selectedFlavors]);

  const visibleDishes = showAll
    ? rankedDishes
    : rankedDishes.slice(0, 6);

  const activeFlavorNames = selectedFlavors
    .map(
      (id) => flavors.find((flavor) => flavor.id === id)?.name
    )
    .filter(Boolean)
    .join(" + ");

  const accentColor =
    flavors.find((flavor) => flavor.id === selectedFlavors[0])
      ?.color ?? "#E28C5C";

  const dynamicStyle = {
    "--compass-accent": accentColor,
  } as CSSProperties;

  const selectionKey = selectedFlavors.join("-");

  /* Scroll reveal with reduced-motion support. */

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const elements = Array.from(
      section.querySelectorAll<HTMLElement>(
        "[data-compass-reveal]"
      )
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
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
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px",
      }
    );

    elements.forEach((element) => {
      if (element.dataset.revealState === "visible") {
        return;
      }

      element.dataset.revealState = "hidden";
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [selectionKey, showAll]);

  return (
    <section
      ref={sectionRef}
      id="craving-compass"
      aria-labelledby="craving-compass-heading"
      style={dynamicStyle}
      className="compass-v3 compass-titanium relative isolate overflow-hidden px-5 py-20 text-[#FFF8EF] sm:px-10 sm:py-24 lg:px-16 lg:py-28"
    >
      {/* Metallic background */}

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
        {/* Header */}

        <div className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
          <div data-compass-reveal className="max-w-4xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="compass-titanium-icon flex h-10 w-10 items-center justify-center rounded-full">
                <Sparkles aria-hidden="true" size={18} />
              </span>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-[#F0A477] sm:text-xs">
                The Flavor Discovery Lab
              </span>

              <span className="hidden h-px w-14 bg-[#F0A477]/50 sm:block" />
            </div>

            <h2
              id="craving-compass-heading"
              className="font-display text-[clamp(3rem,5.7vw,6.2rem)] font-bold leading-[0.98] tracking-[-0.075em]"
            >
              MIX YOUR
              <br />

              <span className="compass-titanium-heading">
                CRAVINGS.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-[#E8E4DC]/80 sm:text-base">
              Your appetite has a personality. Combine the
              flavors you love and uncover food made for
              your mood.
            </p>
          </div>

          <div
            data-compass-reveal
            className="compass-titanium-counter flex w-fit items-center gap-5 rounded-[1.5rem] px-7 py-5"
          >
            <span className="font-display text-5xl font-bold tracking-[-0.07em] text-[#F5C69E]">
              {String(flavors.length).padStart(2, "0")}
            </span>

            <div>
              <p className="font-display text-sm font-bold">
                Flavor Profiles
              </p>

              <p className="mt-1 text-xs text-[#E8E4DC]/65">
                Crafted for discovery
              </p>
            </div>
          </div>
        </div>

        {/* Flavor selector */}

        <div
          data-compass-reveal
          className="compass-glass-panel compass-titanium-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-8 lg:p-10"
        >
          <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3 text-[#F0A477]">
                <ArrowDownRight aria-hidden="true" size={17} />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]">
                  01 / Choose Your Flavor
                </p>
              </div>

              <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.045em] sm:text-3xl">
                What are you feeling?
              </h3>

              <p className="mt-3 text-sm text-[#E8E4DC]/70">
                Choose up to two flavors to discover
                your ideal food matches.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="compass-titanium-selection rounded-full px-4 py-2.5 text-xs font-bold">
                {selectedFlavors.length}/2 Selected
              </span>

              <button
                type="button"
                disabled={selectedFlavors.length === 0}
                onClick={() => {
                  setSelectedFlavors([]);
                  setShowAll(false);
                }}
                className="compass-titanium-clear inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#F5C69E] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw aria-hidden="true" size={14} />
                Clear
              </button>
            </div>
          </div>

          <div
            role="group"
            aria-label="Select up to two flavor preferences"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {flavors.map((flavor) => {
              const selected = selectedFlavors.includes(
                flavor.id
              );

              const Icon = flavor.Icon;

              return (
                <button
                  key={flavor.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleFlavor(flavor.id)}
                  className={`compass-flavor-button compass-titanium-flavor relative flex min-h-[126px] min-w-0 flex-col items-start justify-between overflow-hidden rounded-[1.3rem] p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#F5C69E] sm:p-5 ${selected ? "is-selected" : ""
                    }`}
                >
                  <span
                    className="compass-titanium-flavor-icon relative flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      "--flavor-color": flavor.color,
                    } as CSSProperties}
                  >
                    <Icon
                      aria-hidden="true"
                      size={23}
                      strokeWidth={1.8}
                    />
                  </span>

                  <span className="relative mt-4 block">
                    <span className="block font-display text-sm font-bold text-[#FFF8EF] sm:text-base">
                      {flavor.name}
                    </span>

                    <span className="mt-1 block text-[10px] leading-4 text-[#E8E4DC]/65">
                      {flavor.description}
                    </span>
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
              Combine two flavors for more specific food
              recommendations.
            </span>

            <span className="flex items-center gap-2 font-bold text-[#F5C69E]">
              <Sparkles aria-hidden="true" size={14} />
              Curated for your craving
            </span>
          </div>
        </div>

        {/* Results heading */}

        <div
          data-compass-reveal
          className="mb-8 mt-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end lg:mt-16"
        >
          <div>
            <div className="flex items-center gap-3 text-[#F0A477]">
              <ArrowDownRight aria-hidden="true" size={17} />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]">
                02 / Your Food Matches
              </p>
            </div>

            <h3 className="mt-4 font-display text-[clamp(2rem,3.8vw,3.5rem)] font-bold tracking-[-0.055em]">
              {selectedFlavors.length
                ? "Made for your mood."
                : "Your next bite awaits."}
            </h3>

            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mt-3 text-sm text-[#E8E4DC]/70"
            >
              {selectedFlavors.length
                ? `${activeFlavorNames} — ${rankedDishes.length} matching demo dishes.`
                : "Choose a flavor to explore matching dishes."}
            </p>
          </div>

          {selectedFlavors.length > 0 && (
            <div className="compass-titanium-mix flex items-center gap-3 rounded-[1.2rem] px-5 py-4">
              <Sparkles
                aria-hidden="true"
                size={19}
                className="shrink-0 text-[#F0A477]"
              />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
                  Your Flavor Mix
                </p>

                <p className="mt-1 font-display text-sm font-bold text-[#F5C69E]">
                  {activeFlavorNames}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Results */}

        {selectedFlavors.length === 0 ? (
          <div className="compass-titanium-empty flex min-h-[280px] flex-col items-center justify-center rounded-[2rem] px-6 py-12 text-center">
            <UtensilsCrossed
              aria-hidden="true"
              size={38}
              strokeWidth={1.5}
              className="text-[#F0A477]"
            />

            <h4 className="mt-5 font-display text-2xl font-bold">
              Every craving starts somewhere.
            </h4>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#E8E4DC]/70">
              Choose a flavor above to discover food
              recommendations.
            </p>
          </div>
        ) : (
          <>
            <div
              className={`compass-results-grid grid gap-6 ${visibleDishes.length === 1
                  ? "grid-cols-1"
                  : visibleDishes.length === 2 ||
                    visibleDishes.length === 4
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-2 xl:grid-cols-3"
                }`}
            >
              {visibleDishes.map((dish, index) => (
                <FoodCard
                  key={dish.id}
                  dish={dish}
                  index={index}
                />
              ))}
            </div>

            {rankedDishes.length > 6 && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setShowAll((current) => !current)
                  }
                  className="compass-titanium-more group inline-flex min-h-[56px] items-center gap-4 rounded-full px-8 font-display text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C69E]"
                >
                  {showAll
                    ? "Show Fewer Dishes"
                    : `Explore All ${rankedDishes.length} Matches`}

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
            Curated frontend demo recommendations.
            Match percentages represent flavor-tag overlap,
            not AI predictions or live database results.
          </p>

          <p className="shrink-0 font-bold uppercase tracking-[0.17em] text-[#F0A477]">
            Street Fresh Discovery
          </p>
        </div>
      </div>
    </section>
  );
}