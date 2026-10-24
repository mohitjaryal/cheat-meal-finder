import type { Metadata } from "next";

import DiscoveryNavbar from "@/components/discovery/DiscoveryNavbar";
import DiscoveryFooter from "@/components/discovery/DiscoveryFooter";
import FoodSearchExperience from "@/components/search/FoodSearchExperience";

export const metadata: Metadata = {
  title: "Explore Food | Cheat Meal Finder",
  description:
    "Discover dishes worth craving. Explore real food listings from local vendors.",
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#FFFAF0] text-[#30221D]">
      <div className="sticky top-0 z-50 -mb-[86px] sm:-mb-[90px]">
        <DiscoveryNavbar />
      </div>

      <FoodSearchExperience />

      <DiscoveryFooter />
    </main>
  );
}