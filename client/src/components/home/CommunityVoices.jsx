'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import styles from './CommunityVoices.module.css';

export default function CommunityVoices() {
  // Testimonial data (Anonymous to respect privacy, which aligns with mental health ethics)
  const testimonials = [
    {
      id: 1,
      quote: "I was extremely anxious about walking through the doors for the first time. The team here didn't just welcome me; they made me feel like I finally belonged somewhere.",
      name: "Anonymous",
      role: "Grief Circle Attendee",
      initial: "A"
    },
    {
      id: 2,
      quote: "The 'Pay What You Can' model is the only reason I was able to access trauma-informed yoga. It has fundamentally changed how I handle stress.",
      name: "Sarah M.",
      role: "Community Member",
      initial: "S"
    },
    {
      id: 3,
      quote: "My financial wellness counselor helped me navigate debt without making me feel ashamed. This place truly heals the whole person, not just the symptoms.",
      name: "David T.",
      role: "Workshop Participant",
      initial: "D"
    }
  ];

  // Framer Motion entrance animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 20 }
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Voices of our community</h2>
        </div>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={cardVariants} className={styles.card}>
              
              <Quote size={32} className={styles.quoteIcon} />
              
              <p className={styles.quoteText}>"{testimonial.quote}"</p>
              
              <div className={styles.authorWrapper}>
                <div className={styles.avatarPlaceholder}>
                  {testimonial.initial}
                </div>
                <div className={styles.authorDetails}>
                  <span className={styles.authorName}>{testimonial.name}</span>
                  <span className={styles.authorRole}>{testimonial.role}</span>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}