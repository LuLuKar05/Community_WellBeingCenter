'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeartHandshake, Leaf, Users } from 'lucide-react';
import styles from './CorePillars.module.css';

export default function CorePillars() {
  const pillars = [
    {
      id: 1,
      title: "Therapy & Support",
      description: "Peer-led circles and professional guidance in a safe, non-judgmental environment. Healing happens together.",
      icon: <HeartHandshake size={32} strokeWidth={1.5} />
    },
    {
      id: 2,
      title: "Mindful Movement",
      description: "Trauma-informed yoga and somatic practices designed to help you reconnect with your body at your own pace.",
      icon: <Leaf size={32} strokeWidth={1.5} />
    },
    {
      id: 3,
      title: "Community Resources",
      description: "Financial wellness workshops, art therapy, and shared spaces to foster local kinship and resilience.",
      icon: <Users size={32} strokeWidth={1.5} />
    }
  ];

  // Framer Motion staggered animation logic
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>How we support you</h2>
          <p className={styles.subtitle}>
            Our programs are designed around three core pillars to nurture your mental, physical, and emotional wellbeing.
          </p>
        </div>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {pillars.map((pillar) => (
            <motion.div key={pillar.id} variants={cardVariants} className={styles.card}>
              <div className={styles.iconWrapper}>
                {pillar.icon}
              </div>
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p className={styles.cardDesc}>{pillar.description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}