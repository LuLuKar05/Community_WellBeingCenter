'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './EditorialDonation.module.css';
import { useRouter } from 'next/navigation';
import donationImage from '../../assets/Donate/donationPage1.jpg';

// ─── Sub-components ───────────────────────────────────────────────────────────

const EditorialText = () => (
  <div className={styles.textWrapper}>
    <p className={styles.eyebrow}>Ways to Give</p>
    <h2 className={styles.title}>
      Space to <em>breathe.</em><br />
      Room to grow.
    </h2>
    <p className={styles.description}>
      Your generosity ensures our doors remain open and our programs remain
      accessible — fostering a community where mental and physical wellbeing
      is a shared reality, not a luxury.
    </p>
  </div>
);

const EditorialImage = ({ src, alt, caption }) => (
  <div className={styles.imageWrapper}>
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 900px) 100vw, 40vw"
      className={styles.image}
      priority
    />
    {caption && <p className={styles.caption}>{caption}</p>}
  </div>
);

const DONATION_AMOUNTS = [10, 50, 100];

const DonationWidget = () => {
  const router = useRouter();

  return (
    <div className={styles.widgetWrapper}>
      <h3 className={styles.widgetTitle}>Ways to Give</h3>

      <div className={styles.amountGrid}>
        {DONATION_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => router.push(`/donate?amount=${amount}`)}
            className={styles.btnAmount}
          >
            Give £{amount}
          </button>
        ))}
      </div>

      <button onClick={() => router.push('/donate')} className={styles.btnSubmit}>
        Enter Custom Amount
      </button>

      <div className={styles.secondaryLinks}>
        <span>Looking to give time? <Link href="/volunteer" className={styles.link}>Explore Volunteering</Link></span>
        <span>Represent a business? <Link href="/sponsor" className={styles.link}>View Sponsorships</Link></span>
      </div>
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

export default function EditorialDonation() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <EditorialText />
        <DonationWidget />
        <EditorialImage
          src={donationImage}
          alt="The main atrium at the Community Wellbeing Center"
          caption="The Main Atrium"
        />
      </div>
    </section>
  );
}
