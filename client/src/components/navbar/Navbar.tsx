"use client";

/**
 * Navbar — context-aware global site header.
 *
 * Behaviours taken from the reference navbar:
 *
 *  FOLD STATE (transparent / hamburger):
 *    Any page section marked with `data-nav-fold` will make the navbar
 *    go transparent and hide the desktop links while that section is
 *    visible in the viewport. A hamburger button appears instead.
 *    Add `data-nav-fold` to any hero / full-screen section on any page.
 *
 *  ACTIVE LINK:
 *    The current pathname is compared against each link's href.
 *    The matching link gets an underline animation and bolder weight.
 *
 *  FULLSCREEN MENU:
 *    Clicking the hamburger opens a full-screen overlay with giant
 *    animated links (Framer Motion spring cascade). Body scroll is
 *    locked while the menu is open.
 *
 *  AUTH:
 *    Right slot shows Clerk's <SignInButton> when logged out,
 *    <UserButton> when logged in — both in desktop bar and in the
 *    fullscreen overlay.
 *
 * To add / remove nav links:
 *   Edit the NAV_LINKS array below — the desktop bar and fullscreen
 *   overlay both render from the same source of truth.
 */

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import styles from "./Navbar.module.css";

// ── Nav link definitions — single source of truth ────────────────────────────
// Donate is a standalone CTA button in the right slot, not in this list.
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/programmes", label: "Programmes" },
  { href: "/about", label: "About" },
  { href: "/contactUs", label: "Contact" },
  { href: "/news", label: "News" },
];

// ── Framer Motion variants ────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeInOut" as const } },
  exit:   { opacity: 0, transition: { duration: 0.3, delay: 0.15 } },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 as const },
  },
};

const itemVariants = {
  hidden:   { y: 40, opacity: 0 },
  visible:  { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 250, damping: 20 } },
  exit:     { y: 20, opacity: 0, transition: { duration: 0.2 } },
};

// ── Default fold selector ─────────────────────────────────────────────────────
const DEFAULT_FOLD_SELECTOR = "[data-nav-fold]";

// ── Component ─────────────────────────────────────────────────────────────────

interface NavbarProps {
  /** CSS selector for elements that trigger the transparent/folded state. */
  foldSelector?: string;
}

export default function Navbar({ foldSelector = DEFAULT_FOLD_SELECTOR }: NavbarProps) {
  const pathname = usePathname();
  const [isFolded, setIsFolded]   = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ── Fold logic — IntersectionObserver on data-nav-fold elements ─────────────
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll(foldSelector));
    if (targets.length === 0) {
      setIsFolded(false);
      return;
    }

    // Sync check: fold immediately without waiting for observer first callback
    const anyVisible = targets.some((el) => {
      const { top, bottom } = el.getBoundingClientRect();
      return top < window.innerHeight && bottom >= 0;
    });
    setIsFolded(anyVisible);

    // Track multiple intersecting targets so the bar stays folded when two
    // back-to-back full-screen sections are both partially visible
    const intersecting = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) intersecting.add(entry.target);
          else intersecting.delete(entry.target);
        });

        const shouldFold = intersecting.size > 0;
        setIsFolded(shouldFold);
        if (!shouldFold) setIsMenuOpen(false);
      },
      { root: null, threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();

    // Re-run on pathname change so newly rendered pages are observed
  }, [foldSelector, pathname]);

  // ── Body scroll lock while menu is open ──────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu  = useCallback(() => setIsMenuOpen(false), []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <header className={`${styles.header} ${isFolded ? styles.folded : ""} ${isMenuOpen ? styles.menuOpen : ""}`}>

        {/* Brand */}
        <Link href="/" className={styles.brand} onClick={closeMenu}>
          Community Wellbeing
        </Link>

        {/* Desktop nav links */}
        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${pathname === href ? styles.active : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right slot: Donate CTA + auth + hamburger — always visible */}
        <div className={styles.rightSlot}>
          {/* Donate CTA button */}
          <Link href="/donate" className={styles.donateBtn} onClick={closeMenu}>
            Donate
          </Link>

          {/* Auth — always visible in the bar */}
          <div className={styles.authArea}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className={styles.signInBtn}>Sign In</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>

          {/* Hamburger — always visible on mobile; visible on desktop only when folded */}
          <button
            className={styles.menuButton}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6"  x2="6"  y2="18" />
                <line x1="6"  y1="6"  x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3"  y1="6"  x2="21" y2="6"  />
                <line x1="3"  y1="12" x2="21" y2="12" />
                <line x1="3"  y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Fullscreen overlay menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={styles.overlay}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Giant animated links */}
            <motion.ul
              className={styles.overlayLinks}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <motion.li key={href} variants={itemVariants}>
                  <Link
                    href={href}
                    className={`${styles.giantLink} ${pathname === href ? styles.giantLinkActive : ""}`}
                    onClick={closeMenu}
                  >
                    {label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>


          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
