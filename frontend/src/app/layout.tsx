import type { Metadata } from "next";
import {
  Manrope,
  Space_Grotesk,
} from "next/font/google";

import StreetFreshCursor from "@/components/motion/StreetFreshCursor";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cheat Meal Finder",
    template: "%s | Cheat Meal Finder",
  },
  description:
    "Discover local street-food dishes, vendors, cravings, ratings, and real reviews.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}

        <StreetFreshCursor />
      </body>
    </html>
  );
}