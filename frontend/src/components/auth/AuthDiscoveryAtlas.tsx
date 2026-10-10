type AuthVariant = "signup" | "login";

type AuthDiscoveryAtlasProps = {
  variant?: AuthVariant;
  className?: string;
};

/* ================================================================
   STREET MAP
================================================================ */

function StreetMap() {
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id="atlas-streets"
          width="230"
          height="210"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-16)"
        >
          <path
            d="M0 45H230M0 150H230M55 0V210M165 0V210"
            fill="none"
            stroke="#786A61"
            strokeOpacity="0.14"
            strokeWidth="2"
          />

          <path
            d="M0 97H230M110 0V210"
            fill="none"
            stroke="#5A6E44"
            strokeOpacity="0.11"
            strokeWidth="1"
            strokeDasharray="8 12"
          />
        </pattern>

        <pattern
          id="atlas-blocks"
          width="230"
          height="210"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-16)"
        >
          <rect
            x="72"
            y="61"
            width="52"
            height="37"
            rx="7"
            fill="#5A6E44"
            fillOpacity="0.045"
          />

          <rect
            x="173"
            y="118"
            width="38"
            height="49"
            rx="6"
            fill="#DDA15E"
            fillOpacity="0.055"
          />

          <rect
            x="12"
            y="160"
            width="35"
            height="30"
            rx="5"
            fill="#C45A34"
            fillOpacity="0.04"
          />
        </pattern>

        <linearGradient id="atlas-fade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.65" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.35" />
          <stop offset="1" stopColor="white" stopOpacity="0.65" />
        </linearGradient>

        <mask id="atlas-visibility-mask">
          <rect width="1600" height="1000" fill="url(#atlas-fade)" />
        </mask>
      </defs>

      <g mask="url(#atlas-visibility-mask)">
        <rect width="1600" height="1000" fill="url(#atlas-streets)" />
        <rect width="1600" height="1000" fill="url(#atlas-blocks)" />

        <path
          d="M-70 210C170 110 260 320 480 215S810 95 1010 235S1390 350 1690 130"
          stroke="#C45A34"
          strokeOpacity="0.17"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        <path
          d="M-100 790C180 640 300 900 530 760S900 650 1110 805S1480 875 1720 670"
          stroke="#5A6E44"
          strokeOpacity="0.16"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/* ================================================================
   LOCATION PIN
================================================================ */

function LocationPin() {
  return (
    <svg viewBox="0 0 80 100" fill="none" className="h-full w-full">
      <path
        d="M40 7C20 7 8 22 8 41C8 67 40 92 40 92S72 67 72 41C72 22 60 7 40 7Z"
        fill="#C45A34"
        fillOpacity="0.13"
        stroke="#C45A34"
        strokeOpacity="0.65"
        strokeWidth="3"
      />

      <circle
        cx="40"
        cy="40"
        r="13"
        fill="#FFFAF0"
        stroke="#C45A34"
        strokeOpacity="0.6"
        strokeWidth="3"
      />
    </svg>
  );
}

/* ================================================================
   COMPASS
================================================================ */

function CompassIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
      <circle
        cx="100"
        cy="100"
        r="80"
        stroke="#786A61"
        strokeOpacity="0.5"
        strokeWidth="2"
      />

      <circle
        cx="100"
        cy="100"
        r="65"
        stroke="#DDA15E"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeDasharray="6 8"
      />

      <path
        d="M100 19V181M19 100H181"
        stroke="#786A61"
        strokeOpacity="0.4"
        strokeWidth="2"
      />

      <path
        d="M100 46L121 100L100 154L79 100L100 46Z"
        fill="#C45A34"
        fillOpacity="0.12"
        stroke="#C45A34"
        strokeOpacity="0.6"
        strokeWidth="2.5"
      />

      <circle cx="100" cy="100" r="8" fill="#DDA15E" />

      <text
        x="100"
        y="14"
        textAnchor="middle"
        fontSize="13"
        fill="#786A61"
      >
        N
      </text>
    </svg>
  );
}

/* ================================================================
   FOOD TRUCK
================================================================ */

function FoodTruckIllustration() {
  return (
    <svg viewBox="0 0 260 150" fill="none" className="h-full w-full">
      <path
        d="M28 55H166V118H28V55Z"
        fill="#DDA15E"
        fillOpacity="0.1"
        stroke="#C45A34"
        strokeOpacity="0.7"
        strokeWidth="3"
      />

      <path
        d="M166 76H207L232 100V118H166V76Z"
        fill="#5A6E44"
        fillOpacity="0.08"
        stroke="#C45A34"
        strokeOpacity="0.7"
        strokeWidth="3"
      />

      <path
        d="M43 68H148V97H43V68Z"
        stroke="#786A61"
        strokeOpacity="0.65"
        strokeWidth="3"
      />

      <path
        d="M36 54L51 30H144L161 54"
        stroke="#C45A34"
        strokeOpacity="0.7"
        strokeWidth="3"
      />

      <circle
        cx="72"
        cy="120"
        r="17"
        fill="#FFFAF0"
        stroke="#786A61"
        strokeOpacity="0.75"
        strokeWidth="4"
      />

      <circle
        cx="194"
        cy="120"
        r="17"
        fill="#FFFAF0"
        stroke="#786A61"
        strokeOpacity="0.75"
        strokeWidth="4"
      />

      <path
        d="M190 84H206L219 99H190V84Z"
        stroke="#5A6E44"
        strokeOpacity="0.7"
        strokeWidth="2"
      />
    </svg>
  );
}

/* ================================================================
   NEW — PREMIUM CULINARY SERVING CLOCHE V5.4
================================================================ */

function ServingClocheIllustration() {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Steam */}
      <path
        d="M91 46C78 33 101 25 91 12"
        stroke="#C45A34"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M121 40C108 28 133 18 121 5"
        stroke="#DDA15E"
        strokeOpacity="0.7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M151 46C139 33 161 25 151 12"
        stroke="#5A6E44"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Dome handle */}
      <circle
        cx="120"
        cy="62"
        r="8"
        fill="#DDA15E"
        fillOpacity="0.18"
        stroke="#C45A34"
        strokeOpacity="0.65"
        strokeWidth="3"
      />

      {/* Serving dome */}
      <path
        d="M38 135C40 96 74 69 120 69C166 69 200 96 202 135"
        fill="#DDA15E"
        fillOpacity="0.09"
        stroke="#C45A34"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Dome interior highlight */}
      <path
        d="M67 117C77 96 94 86 114 84"
        stroke="#DDA15E"
        strokeOpacity="0.65"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Serving tray */}
      <path
        d="M24 136H216"
        stroke="#C45A34"
        strokeOpacity="0.75"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="M43 145C72 160 168 160 197 145"
        stroke="#5A6E44"
        strokeOpacity="0.65"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Decorative accent dots */}
      <circle cx="53" cy="127" r="3" fill="#DDA15E" fillOpacity="0.65" />
      <circle cx="187" cy="127" r="3" fill="#DDA15E" fillOpacity="0.65" />
    </svg>
  );
}

/* ================================================================
   AUTH DISCOVERY ATLAS V5.4

   Preserves:
   - Street map
   - Compass
   - Location pins
   - Food truck
   - Existing animations

   Adds:
   - Serving Cloche illustration
================================================================ */

export default function AuthDiscoveryAtlas({
  variant = "signup",
  className = "",
}: AuthDiscoveryAtlasProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "auth-discovery-atlas",
        `auth-discovery-atlas--${variant}`,
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      ].join(" ")}
    >
      <div className="auth-atlas-map">
        <StreetMap />
      </div>

      <div className="auth-atlas-element auth-atlas-compass">
        <CompassIllustration />
      </div>

      <div className="auth-atlas-element auth-atlas-pin-a">
        <LocationPin />
      </div>

      <div className="auth-atlas-element auth-atlas-pin-b">
        <LocationPin />
      </div>

      <div className="auth-atlas-element auth-atlas-food-truck">
        <FoodTruckIllustration />
      </div>

      {/* NEW: Culinary serving cloche */}
      <div className="auth-atlas-element auth-atlas-cloche">
        <ServingClocheIllustration />
      </div>
    </div>
  );
}