'use client';

import Link from 'next/link';
import styles from './CalendarView.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

// One token-based colour per category for the left accent bar
const CAT_COLOR = {
  'Movement & Yoga':   'var(--color-primary)',
  'Mental Health':     'var(--color-accent)',
  'Community Support': 'var(--color-blue)',
  'Events':            'var(--color-success)',
};

export default function CalendarView({ programmes, bookedIds }) {
  const byDay = Object.fromEntries(
    DAYS.map(d => [d, programmes.filter(p => p.day === d)])
  );

  const hasSessions = programmes.length > 0;

  return (
    <div className={styles.wrapper}>
      {!hasSessions ? (
        <p className={styles.empty}>No sessions match your current filters.</p>
      ) : (
        <div className={styles.grid}>
          {DAYS.map(day => (
            <div key={day} className={styles.col}>

              {/* Day header */}
              <div className={styles.colHeader}>
                <span className={styles.dayShort}>{SHORT[day]}</span>
                <span className={styles.dayFull}>{day}</span>
                {byDay[day].length > 0 && (
                  <span className={styles.colCount}>{byDay[day].length}</span>
                )}
              </div>

              {/* Sessions */}
              <div className={styles.sessions}>
                {byDay[day].length === 0 ? (
                  <div className={styles.quietDay}>—</div>
                ) : (
                  byDay[day].map(p => {
                    const booked = bookedIds.has(String(p._id));
                    return (
                      <Link
                        key={p._id}
                        href={`/programmes/${p._id}`}
                        className={`${styles.card} ${booked ? styles.cardBooked : ''}`}
                      >
                        {/* Left accent bar coloured by category */}
                        <span
                          className={styles.bar}
                          style={{ background: CAT_COLOR[p.category] ?? 'var(--color-accent)' }}
                        />

                        <div className={styles.info}>
                          <span className={styles.time}>{p.timeStr}</span>
                          <span className={styles.title}>{p.title}</span>
                          <span className={styles.cat}>{p.category}</span>
                        </div>

                        {booked && <span className={styles.tick} aria-label="Registered">✓</span>}
                      </Link>
                    );
                  })
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      {hasSessions && (
        <div className={styles.legend}>
          {Object.entries(CAT_COLOR).map(([label, color]) => (
            <span key={label} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: color }} />
              {label}
            </span>
          ))}
          <span className={styles.legendItem}>
            <span className={styles.legendBooked}>✓</span>
            Registered
          </span>
        </div>
      )}
    </div>
  );
}
