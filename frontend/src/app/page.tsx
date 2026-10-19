import DiscoveryNavbar from "@/components/discovery/DiscoveryNavbar";
import CravingOrbit from "@/components/discovery/CravingOrbit";
import CategoryExplorer from "@/components/discovery/CategoryExplorer";
import CravingSpotlight from "@/components/discovery/CravingSpotlight";
import CravingCompass from "@/components/discovery/CravingCompass";
import DiscoveryFooter from "@/components/discovery/DiscoveryFooter";

export default function Home() {
  return (
    <main
      id="top"
      className="relative min-h-screen bg-cream text-espresso"
    >
      {/* ============================================================
          STREET FRESH PREMIUM — STICKY FLOATING NAVBAR V6

          Original navbar dimensions preserved:
          Mobile: 62px
          Desktop: 66px

          Navbar remains visible across all homepage sections.
      ============================================================ */}

      <div className="sticky top-0 z-50 -mb-[78px] sm:-mb-[86px] lg:-mb-[90px]">
        <DiscoveryNavbar />
      </div>

      {/* ============================================================
          SECTION 1 — CRAVING ORBIT HERO
      ============================================================ */}

      <CravingOrbit />

      {/* ============================================================
          SECTION 2 — CATEGORY EXPLORER
      ============================================================ */}

      <div id="explore">
        <CategoryExplorer />
      </div>

      {/* ============================================================
          SECTION 3 — CRAVING STAGE
      ============================================================ */}

      <CravingSpotlight />

      {/* ============================================================
          SECTION 4 — CRAVING COMPASS
      ============================================================ */}

      <CravingCompass />

      {/* ============================================================
          STREET FRESH SIGNATURE FOOTER
      ============================================================ */}

      <DiscoveryFooter />
    </main>
  );
}