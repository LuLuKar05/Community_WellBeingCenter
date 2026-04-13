'use client';

import { motion } from 'framer-motion';
import styles from './ImpactStats.module.css';

export default function ImpactStats() {
  const stats = [
    { number: "2,500+", label: "Hours of Therapy Provided" },
    { number: "100%", label: "Community Funded" },
    { number: "350+", label: "Active Members" }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.label}
            className={styles.statItem}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <h3 className={styles.number}>{stat.number}</h3>
            <p className={styles.label}>{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}