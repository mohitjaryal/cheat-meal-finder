import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  Heart,
  MapPin,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

const footerLinks = [
  {
    label: "Home",
    href: "/#top",
  },
  {
    label: "Explore Categories",
    href: "/#explore",
  },
  {
    label: "Craving Compass",
    href: "/#craving-compass",
  },
];

export default function DiscoveryFooter() {
  return (
    <footer
      aria-label="Cheat Meal Finder website footer"
      className="relative isolate overflow-hidden bg-[#080F1A] text-[#F3F7FC]"
    >
      {/* ============================================================
          MIDNIGHT BLUE × SOFT GRAPHITE BACKGROUND
      ============================================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {/* Deep midnight-blue foundation */}
        <div className="absolute inset-0 bg-[linear-gradient(118deg,#09111F_0%,#142338_38%,#101A2B_67%,#070C16_100%)]" />

        {/* Left atmospheric blue illumination */}
        <div className="absolute -left-[18%] -top-[65%] h-[850px] w-[850px] rounded-full bg-[#5685B6]/[0.18] blur-[125px]" />

        {/* Right atmospheric blue illumination */}
        <div className="absolute -right-[15%] -bottom-[90%] h-[850px] w-[850px] rounded-full bg-[#356B9A]/[0.17] blur-[130px]" />

        {/* Silver-blue reflection */}
        <div className="absolute left-[43%] top-[-65%] h-[680px] w-[500px] -rotate-12 rounded-full bg-[#AEC8E0]/[0.055] blur-[110px]" />

        {/* Fine atmospheric texture */}
        <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(#B3CADF_0.55px,transparent_0.55px)] [background-size:9px_9px]" />

        {/* Architectural framing */}
        <div className="absolute inset-y-0 left-[10%] hidden w-px bg-white/[0.045] lg:block" />

        <div className="absolute inset-y-0 right-[10%] hidden w-px bg-white/[0.045] lg:block" />
      </div>

      {/* ============================================================
          MAIN FOOTER CONTENT
      ============================================================ */}

      <div className="relative mx-auto max-w-[1450px] px-5 pb-7 pt-16 sm:px-10 sm:pt-20 lg:px-16 lg:pt-24">
        <div className="grid gap-12 border-b border-white/[0.12] pb-12 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16 lg:pb-16">
          {/* ========================================================
              BRAND COLUMN
          ======================================================== */}

          <div className="mx-auto w-full max-w-[530px] text-center lg:mx-0 lg:text-left">
            {/* Navbar-matched brand */}

            <Link
              href="/"
              aria-label="Cheat Meal Finder — Home"
              className="group mb-7 inline-flex items-center justify-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A9D0F0] lg:justify-start"
            >
              {/* Original food logo */}

              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#FFFAF0] shadow-[0_5px_20px_rgba(0,0,0,0.2)]">
                <Image
                  src="/images/cheat-meal-logo-candidate.png"
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
                />
              </span>

              {/* Brand typography */}

              <span className="flex flex-col items-start leading-none">
                <span className="font-display text-[17px] font-extrabold tracking-[-0.045em] text-[#F3F7FC]">
                  CHEAT
                  <span className="text-[#A9D0F0]">MEAL</span>
                </span>

                <span className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.19em] text-[#A2AFC0]">
                  FOOD FINDER
                </span>
              </span>
            </Link>

            {/* Headline */}

            <h2 className="text-[clamp(2.2rem,9vw,5.4rem)] font-black uppercase leading-[1.04] tracking-[-0.075em] lg:leading-[0.97]">
              GREAT FOOD.
              <br />
              <span className="text-[#A9D0F0]">
                REAL CRAVINGS.
              </span>
            </h2>

            {/* Description */}

            <p className="mx-auto mt-6 max-w-[440px] text-[14px] leading-[1.85] text-[#B2BECC] sm:text-[15px] lg:mx-0 lg:mt-7">
              Discover unforgettable street food, signature dishes, and local
              flavors worth exploring.
            </p>
          </div>

          {/* ========================================================
              EXPLORE COLUMN
          ======================================================== */}

          <nav
            aria-label="Footer navigation"
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
              <Compass
                size={19}
                strokeWidth={1.8}
                className="text-[#A9D0F0]"
                aria-hidden="true"
              />

              <h3 className="text-[12px] font-black uppercase tracking-[0.22em] text-[#F3F7FC]">
                Explore
              </h3>
            </div>

            {/* Single-row mobile navigation */}

            <ul className="flex w-full flex-nowrap items-center justify-center gap-x-3 min-[375px]:gap-x-4 sm:gap-x-6 lg:w-auto lg:flex-col lg:items-start lg:gap-x-0 lg:gap-y-4">
              {footerLinks.map((link) => (
                <li
                  key={link.href}
                  className="min-w-0 shrink-0"
                >
                  <Link
                    href={link.href}
                    className="group inline-flex min-h-11 items-center justify-center gap-1 whitespace-nowrap rounded-sm text-[clamp(0.6rem,2.45vw,0.875rem)] font-semibold text-[#C3CEDB] transition-colors duration-300 hover:text-[#A9D0F0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A9D0F0] lg:justify-start lg:gap-2 lg:text-[14px]"
                  >
                    <span>{link.label}</span>

                    <ArrowUpRight
                      size={12}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="shrink-0 text-[#8EB8DD]/60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#A9D0F0] motion-reduce:transform-none lg:h-[15px] lg:w-[15px]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ========================================================
              MADE FOR DISCOVERY COLUMN
          ======================================================== */}

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
              <MapPin
                size={19}
                strokeWidth={1.8}
                className="text-[#A9D0F0]"
                aria-hidden="true"
              />

              <h3 className="text-[12px] font-black uppercase tracking-[0.22em] text-[#F3F7FC]">
                Made for Discovery
              </h3>
            </div>

            <p className="max-w-[330px] text-[14px] leading-[1.85] text-[#B2BECC] lg:max-w-[305px]">
              From bustling street stalls to hidden neighborhood favorites,
              every great food story starts with a craving.
            </p>

            {/* Decorative editorial badge */}

            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-[#8EB8DD]/20 bg-[#8EB8DD]/[0.07] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#A9D0F0] lg:mt-8">
              <Sparkles
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <span>Follow your appetite</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            BOTTOM SIGNATURE
        ============================================================ */}

        <div className="flex flex-col items-center gap-4 pt-7 text-center sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
          {/* Copyright */}

          <p className="text-[11px] font-medium leading-relaxed tracking-[0.02em] text-[#A2AFC0]">
            © {new Date().getFullYear()} Cheat Meal Finder. All rights
            reserved.
          </p>

          {/* Brand signature */}

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium text-[#A2AFC0]">
              <UtensilsCrossed
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              Built for food discovery
            </span>

            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-[#8EB8DD]/50 sm:block"
            />

            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#A9D0F0]">
              <Heart
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              Street Fresh Premium
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}