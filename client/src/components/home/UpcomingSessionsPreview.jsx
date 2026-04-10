'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TicketCard from '../programmes/Card';
import styles from './UpcomingSessionsPreview.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Skeleton shown while data is loading
function SkeletonCard() {
  return <div className={styles.skeleton} aria-hidden="true" />;
}

export default function UpcomingSessionsPreview() {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/programmes`)
      .then((res) => res.json())
      .then((data) => {
        // Accept either { programmes: [...] } or a raw array
        const list = Array.isArray(data) ? data : (data.programmes ?? []);
        setProgrammes(list.slice(0, 3));
      })
      .catch(() => {
        // Backend unreachable — show empty state gracefully
        setProgrammes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h2 className={styles.title}>Upcoming Sessions</h2>
          <p className={styles.subtitle}>
            Find a safe space to grow, heal, and connect with your community. Reserve your spot today.
          </p>
        </div>

        <div className={styles.ticketList}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : programmes.length > 0 ? (
            programmes.map((item) => (
              <TicketCard
                key={item._id}
                category={item.category}
                title={item.title}
                description={item.description}
                imageSrc={item.image}
                imageAlt={item.title}
                linkUrl={`/programmes/${item._id}`}
                metaText={`${item.day} · ${item.timeStr}`}
                buttonText="Book Spot"
                isBooked={false}
              />
            ))
          ) : (
            <p className={styles.emptyState}>No upcoming sessions available right now. Check back soon.</p>
          )}
        </div>

        <div className={styles.actionWrapper}>
          <Link href="/programmes" className={styles.viewAllBtn}>
            View Full Schedule
          </Link>
        </div>

      </div>
    </section>
  );
}
