// components/TicketCard.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Card.module.css';
import image from '../../assets/Donate/donationPage1.jpg';

export default function TicketCard({
  category,
  title,
  description,
  imageSrc,
  imageAlt,
  linkUrl = '#',
  metaText = "View Info",
  buttonText = "Details"
}) {
  return (
    <article className={styles.ticketCard}>

      {/* Left Body */}
      <div className={styles.ticketMain}>
        <div className={styles.imageWrapper}>
          <Image
            src={imageSrc || image}
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
      
      {/* Right Stub */}
      <div className={styles.ticketStub}>
        <div className={styles.stubMeta}>{metaText}</div>
        <Link href={linkUrl} className={styles.btnBook}>
          {buttonText}
        </Link>
      </div>

    </article>
  );
}