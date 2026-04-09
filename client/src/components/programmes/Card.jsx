// components/programmes/Card.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Card.module.css';

export default function TicketCard({
  category,
  title,
  description,
  imageSrc,
  imageAlt,
  linkUrl = '#',
  metaText = 'View Info',
  buttonText = 'Details',
  isBooked = false,
}) {
  return (
    <article className={styles.ticketCard}>

      {/* Left body */}
      <div className={styles.ticketMain}>
        <div className={styles.imageWrapper}>
          <Image
            src={imageSrc}
            alt={imageAlt || title}
            fill
            className={styles.ticketImg}
          />
        </div>

        <div className={styles.ticketInfo}>
          <span className={styles.ticketCategory}>{category}</span>
          <h3 className={styles.ticketTitle}>{title}</h3>
          <p className={styles.ticketDesc}>{description}</p>
        </div>
      </div>

      {/* Right stub */}
      <div className={styles.ticketStub}>
        <div className={styles.stubMeta}>{metaText}</div>

        {isBooked ? (
          // User has already booked — show a non-interactive "Registered" badge
          <span className={styles.btnRegistered}>Registered</span>
        ) : (
          <Link href={linkUrl} className={styles.btnBook}>
            {buttonText}
          </Link>
        )}
      </div>

    </article>
  );
}
