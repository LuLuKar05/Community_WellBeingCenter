import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/footer";
import ChatWidget from "../components/ChatWidget";

// ── Fonts ─────────────────────────────────────────────────────────────────────

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial serif used by the donation and wizard sections.
// Registered as a CSS variable so CSS modules can reference it as
// var(--font-cormorant) without importing the font again.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Community Wellbeing Center",
  description:
    "A community hub for mental health, movement, and collective wellbeing.",
};

// ── Layout ────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
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
