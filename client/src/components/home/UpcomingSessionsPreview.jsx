'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './UpcomingSessionsPreview.module.css';

export default function UpcomingSessionsPreview() {
  const upcomingClasses = [
    {
      id: 1,
      category: "Movement & Yoga",
      title: "Morning Flow Yoga",
      description: "Start your day with a gentle, trauma-informed flow designed to center the mind and awaken the body. All levels welcome.",
      imageSrc: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      linkUrl: "/programmes/1",
      metaText: "Today, 10:00 AM"
    },
    {
      id: 2,
      category: "Mental Health",
      title: "Grief Support Circle",
      description: "A safe, peer-led environment to share experiences and find collective healing. Guided by licensed professionals.",
      imageSrc: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
      linkUrl: "/programmes/2",
      metaText: "Today, 6:00 PM"
    },
    {
      id: 3,
      category: "Creative Arts",
      title: "Expressive Watercolor Therapy",
      description: "Process complex emotions through guided watercolor painting. No artistic experience required.",
      imageSrc: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
      linkUrl: "/programmes/4",
      metaText: "Thursday, 2:00 PM"
    },
    {
      id: 4,
      category: "Nutrition",
      title: "Mindful Eating Basics",
      description: "A gentle introduction to building a healthier relationship with food, free from diet culture and restriction.",
      imageSrc: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
      linkUrl: "/programmes/5",
      metaText: "Friday, 1:00 PM"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === upcomingClasses.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? upcomingClasses.length - 1 : prev - 1));
  };

  const activeClass = upcomingClasses[currentIndex];

  // Soft crossfade animation
  const fadeVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Join us this week</h2>
        </div>

        <div className={styles.carouselWrapper}>
          
          {/* Left: Image Box */}
          <div className={styles.imageSide}>
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeClass.imageSrc}
                src={activeClass.imageSrc} 
                alt={activeClass.title}
                className={styles.image}
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            </AnimatePresence>
          </div>

          {/* Right: Content Box */}
          <div className={styles.contentSide}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeClass.id}
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <span className={styles.category}>{activeClass.category}</span>
                <h3 className={styles.classTitle}>{activeClass.title}</h3>
                <span className={styles.metaData}>{activeClass.metaText}</span>
                <p className={styles.description}>{activeClass.description}</p>
                <Link href={activeClass.linkUrl} className={styles.btnBook}>
                  Reserve Spot
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className={styles.controls}>
              <button onClick={prevSlide} className={styles.arrowBtn} aria-label="Previous Class">
                <ChevronLeft size={20} />
              </button>
              
              <div className={styles.indicators}>
                {upcomingClasses.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`${styles.dot} ${currentIndex === index ? styles.dotActive : ''}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button onClick={nextSlide} className={styles.arrowBtn} aria-label="Next Class">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}