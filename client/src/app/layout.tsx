import type { Metadata } from "next";
import { Public_Sans, Playfair_Display, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/footer";
import ChatWidget from "../components/ChatWidget";

// ── Fonts ─────────────────────────────────────────────────────────────────────

// Primary Sans-Serif for highly legible body copy and UI elements.
// Developed by the USWDS for maximum WCAG accessibility.
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Transitional Serif for authoritative, high-trust headings.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Keeping a monospace font for any code snippets or technical system data.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "HEAL | Community Wellbeing Center",
  description:
    "A safe, community hub for mental health, movement therapy, and collective wellbeing.",
};

// ── Layout ────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        /* Injecting our evidence-based typography variables into the root */
        className={`${publicSans.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col" style={{ paddingTop: "68px" }}>
          {/* Global navigation — fixed position, 68px tall */}
          <Navbar />

          {/* Page content */}
          <main className="flex-1">{children}</main>

          {/* AI support chatbot — available on every page */}
          <ChatWidget />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}