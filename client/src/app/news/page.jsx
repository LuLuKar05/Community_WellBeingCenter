'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function NewsPage() {
  // Mock data representing blog posts, center updates, and resources
  const newsItems = [
    {
      id: 1,
      title: "New Community Grant Secures Free Therapy for 2026",
      excerpt: "Thanks to the generous support of the London Community Foundation, we are thrilled to announce that our weekly peer-support groups will remain entirely free for the rest of the year.",
      date: "April 10, 2026",
      category: "Center Update",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
      slug: "new-community-grant"
    },
    {
      id: 2,
      title: "5 Simple Box Breathing Techniques for Anxiety",
      excerpt: "When things feel overwhelming, your breath is your anchor. Dr. Sarah Jenkins breaks down a 2-minute exercise you can do anywhere, anytime.",
      date: "March 28, 2026",
      category: "Mindfulness",
      image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80",
      slug: "box-breathing-techniques"
    },
    {
      id: 3,
      title: "Welcoming Marcus Chen to the Wellbeing Team",
      excerpt: "We are expanding our movement therapy options! Join us in welcoming Marcus, who will be leading our new trauma-informed morning yoga flows.",
      date: "March 15, 2026",
      category: "Staff News",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      slug: "welcoming-marcus-chen"
    },
    {
      id: 4,
      title: "The Art of Healing: Highlights from our Creative Therapy Workshop",
      excerpt: "Take a look at the incredible expressions of emotion and community connection from last weekend's watercolor therapy session.",
      date: "February 22, 2026",
      category: "Event Recap",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
      slug: "art-of-healing-recap"
    }
  ];

  // Framer Motion variants for the staggered container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15 // Time between each card animating in
      }
    }
  };

  // Framer Motion variants for individual cards
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Stories & Updates</h1>
        <p className={styles.subtitle}>
          Stay connected with the latest news, mindfulness resources, and community stories from the HEAL Wellbeing Center.
        </p>
      </div>

      {/* The motion.div wraps the grid to control the stagger effect */}
      <motion.div 
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {newsItems.map((item) => (
          <motion.div key={item.id} variants={cardVariants}>
            <Link href={`/news/${item.slug}`} className={styles.card}>
              
              <div className={styles.imageWrapper}>
                <span className={styles.badge}>{item.category}</span>
                <Image src={item.image} alt={item.title} fill className={styles.image} sizes="(max-width: 768px) 100vw, 33vw" />
              </div>

              <div className={styles.content}>
                <div className={styles.meta}>
                  <Calendar size={16} />
                  <time>{item.date}</time>
                </div>
                
                <h2 className={styles.cardTitle}>{item.title}</h2>
                <p className={styles.excerpt}>{item.excerpt}</p>
                
                <span className={styles.readMore}>
                  Read Article <ArrowRight size={18} />
                </span>
              </div>

            </Link>
          </motion.div>
        ))}
      </motion.div>
      
    </main>
  );
}