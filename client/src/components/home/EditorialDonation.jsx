'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './EditorialDonation.module.css';
import { useRouter } from 'next/navigation';
import donationImage from '../../assets/Donate/donationPage1.jpg';

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Left column: large editorial headline + supporting description.
 */
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

/**
 * Right column: portrait image with an optional caption.
 */
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

const DONATION_AMOUNTS = [25, 50, 100];

/**
 * Donation widget: amount selector + CTA + secondary navigation links.
 *
 * Each preset amount is a direct Link to /donate?amount=X so the donate page
 * pre-fills that amount automatically. "Make a Gift" links to /donate with no
 * preset, letting the user choose their own amount from scratch.
 */
// const DonationWidget = () => (
//   <div className={styles.widgetWrapper}>
//     <h3 className={styles.widgetTitle}>Make a Gift</h3>

//     <div className={styles.amountGrid}>
//       {DONATION_AMOUNTS.map((amount) => (
//         <Link
//           key={amount}
//           href={`/donate?amount=${amount}`}
//           className={styles.btnAmount}
//         >
//           £{amount}
//         </Link>
//       ))}
//     </div>

//     <Link href="/donate" className={styles.btnSubmit}>
//       Make a Gift
//     </Link>

//     <div className={styles.secondaryLinks}>
//       <span>
//         Want to give time?{' '}
//         <Link href="/volunteer" className={styles.link}>Explore Volunteering</Link>
//       </span>
//       <span>
//         Representing a business?{' '}
//         <Link href="/sponsor" className={styles.link}>View Sponsorships</Link>
//       </span>
//     </div>
//   </div>
// );
const DonationWidget = () => {
  const router = useRouter();
  const amounts = [10, 50, 100]; 

  // 1. Instantly route when a specific amount is clicked
  const handleExpressDonation = (amount) => {
    router.push(`/donate?amount=${amount}`);
  };

  // 2. Route without an amount when "Custom Amount" is clicked
  const handleCustomAmount = () => {
    router.push(`/donate`);
  };

  return (
    <div className={styles.widgetWrapper}>
      <h3 className={styles.widgetTitle}>Ways to Give</h3>
      
      {/* The Express Amount Buttons */}
      <div className={styles.amountGrid}>
        {amounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handleExpressDonation(amount)}
            className={styles.btnAmount}
            // Add a little extra CSS inline or in your module to make these feel like action buttons
            style={{ fontWeight: '600' }} 
          >
            Give £{amount}
          </button>
        ))}
      </div>
      
      {/* The Custom Amount Fallback */}
      <button onClick={handleCustomAmount} className={styles.btnSubmit}>
        Enter Custom Amount
      </button>

      {/* Secondary Pathways Remain Untouched */}
      <div className={styles.secondaryLinks}>
        <span>Looking to give time? <Link href="/volunteer" className={styles.link}>Explore Volunteering</Link></span>
        <span>Represent a business? <Link href="/sponsor" className={styles.link}>View Sponsorships</Link></span>
      </div>
    </div>
  );
}

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
