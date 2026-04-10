'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
};

export default function Hero() {
  return (
    // data-nav-fold triggers the Navbar's transparent/folded state while this
    // section is visible, creating the cinematic transparent-over-hero effect.
    <section className={styles.hero} data-nav-fold>

      {/* Background image — uses Next.js <Image> for LCP optimisation */}
      <div className={styles.imageWrapper}>
        <Image
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=2000&q=80"
          alt="Group stretching in a sunny studio"
          fill
          priority
          className={styles.image}
          sizes="100vw"
        />
      </div>
      <div className={styles.overlay} />

      {/* Animated content */}
      <motion.div
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.h1 variants={itemVariants} className={styles.title}>
          A foundation for <br />
          <span className={styles.titleHighlight}>collective healing.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className={styles.subtitle}>
          Accessible therapy, mindful movement, and community support.
          Find your safe space at the HEAL Wellbeing Center.
        </motion.p>

        <motion.div variants={itemVariants} className={styles.buttonGroup}>
          <Link href="/programmes" className={styles.btnPrimary}>
            View Schedule
          </Link>
          <Link href="/donate" className={styles.btnSecondary}>
            Support Our Mission
          </Link>
        </motion.div>
      </motion.div>

    </section>
  );
}
