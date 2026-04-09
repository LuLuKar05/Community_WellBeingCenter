'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import CheckoutForm from './CheckoutForm';
import styles from './BookingWizard.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PRESET_AMOUNTS = [5, 10, 15]; // numeric presets only

const slideVariants = {
  enter:  { x: 24, opacity: 0 },
  center: { x: 0,  opacity: 1 },
  exit:   { x: -24, opacity: 0 },
};

// ── Left panel — static programme details ─────────────────────────────────────
function ProgrammePanel({ programme }) {
  const spotsLeft = programme.capacity - programme.enrolled;
  const fillPct   = Math.min((programme.enrolled / programme.capacity) * 100, 100);

  return (
    <aside className={styles.leftPanel}>
      {/* Programme image */}
      {programme.image && (
        <div className={styles.imageWrapper}>
          <Image
            src={programme.image}
            alt={programme.title}
            fill
            className={styles.programmeImg}
          />
        </div>
      )}

      <div className={styles.panelDetails}>
        <span className={styles.categoryBadge}>{programme.category}</span>
        <h1 className={styles.panelTitle}>{programme.title}</h1>

        <p className={styles.panelMeta}>
          {programme.day} &middot; {programme.timeStr}
          {programme.instructor && ` · ${programme.instructor}`}
        </p>

        <p className={styles.panelDesc}>{programme.description}</p>

        {/* Capacity bar */}
        <div className={styles.capacitySection}>
          <span className={styles.capacityLabel}>
            {spotsLeft > 0
              ? `${programme.enrolled} of ${programme.capacity} spots taken`
              : 'Fully booked'}
          </span>
          <div className={styles.capacityTrack}>
            <div className={styles.capacityFill} style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        {programme.price === 0 ? (
          <p className={styles.priceTag}>Free to attend</p>
        ) : (
          <p className={styles.priceTag}>£{programme.price} per session</p>
        )}
      </div>
    </aside>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────
export default function BookingWizard({ programme }) {
  const router   = useRouter();
  const { getToken } = useAuth();

  const [step,        setStep]        = useState(1);
  const [userDetails, setUserDetails] = useState({ firstName: '', lastName: '', email: '' });
  const [amount,      setAmount]      = useState(10);
  const [isSkip,      setIsSkip]      = useState(false);
  const [skipped,     setSkipped]     = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading,   setIsLoading]   = useState(false);
  const [apiError,    setApiError]    = useState('');

  const safeAmount = Number(amount) || 0;

  // ── Step 1 → 2 validation ──────────────────────────────────────────────────
  const handleDetailsNext = () => {
    if (!userDetails.firstName) {
      setApiError('Please enter your first name.');
      return;
    }
    if (!userDetails.email) {
      setApiError('Please enter your email address.');
      return;
    }
    setApiError('');
    setStep(2);
  };

  // ── Step 2 → 3: create PaymentIntent ──────────────────────────────────────
  const handleProceedToPayment = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: safeAmount,
          frequency: 'one-time',
          email: userDetails.email,
          firstName: userDetails.firstName,
          lastName:  userDetails.lastName,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || 'Could not initialise payment.'); return; }
      setClientSecret(data.clientSecret);
      setStep(3);
    } catch {
      setApiError('Unable to reach the payment server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Skip for now → step 4 ─────────────────────────────────────────────────
  const handleSkip = async () => {
    setSkipped(true);
    await saveBooking(false, 0);
    setStep(4);
  };

  // ── Payment success → step 4 ──────────────────────────────────────────────
  const handlePaymentSuccess = async () => {
    await saveBooking(true, safeAmount);
    setStep(4);
  };

  // ── Persist booking to backend ────────────────────────────────────────────
  const saveBooking = async (paid, contributionAmount) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          programmeId: programme._id,
          paid,
          amount: contributionAmount,
        }),
      });
    } catch {
      // Booking save failure is non-critical — the user still sees confirmation.
      // They can contact staff if the record is missing.
      console.error('Could not save booking record.');
    }
  };

  // ── Amount input handler ──────────────────────────────────────────────────
  const handleAmountChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setIsSkip(false);
    setAmount(val > 50 ? 50 : val);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section className={styles.section}>

      {/* Left — programme info */}
      <ProgrammePanel programme={programme} />

      {/* Right — wizard */}
      <div className={styles.wizardWrapper}>
        <div className={styles.wizardCard}>

          {/* Progress bar (hidden on step 4) */}
          {step < 4 && (
            <div className={styles.progress} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
              {[1, 2, 3].map((n) => (
                <div key={n} className={`${styles.progressStep} ${step >= n ? styles.active : ''}`} />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── STEP 1: YOUR DETAILS ───────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className={styles.stepBody}>
                <h3 className={styles.stepTitle}>Your Details</h3>

                <div className={styles.nameGrid}>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="First Name"
                      value={userDetails.firstName}
                      onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                    />
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder="Last Name"
                      value={userDetails.lastName}
                      onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.inputContainer}>
                  <input
                    type="email"
                    className={styles.inputField}
                    placeholder="Email Address"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                    required
                  />
                </div>

                {apiError && <p className={styles.apiError}>{apiError}</p>}

                <button type="button" onClick={handleDetailsNext} className={styles.submitBtn}>
                  Continue
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: SUPPORT ─────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className={styles.stepBody}>
                <button type="button" onClick={() => setStep(1)} className={styles.backBtn}>← Back</button>
                <h3 className={styles.stepTitle}>Support this Programme</h3>
                <p className={styles.supportSubtext}>
                  This programme runs on community support. Pay what you can — every contribution helps.
                </p>

                <div className={styles.presetGrid}>
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => { setIsSkip(false); setAmount(preset); }}
                      className={`${styles.radioBtn} ${!isSkip && amount === preset ? styles.radioBtnActive : ''}`}
                    >
                      £{preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsSkip(true)}
                    className={`${styles.radioBtn} ${isSkip ? styles.radioBtnActive : ''}`}
                  >
                    Skip
                  </button>
                </div>

                {!isSkip && (
                  <>
                    <div className={styles.inputContainer}>
                      <span className={styles.inputPrefix}>£</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        className={styles.inputField}
                        placeholder="Custom amount"
                        min="1"
                        max="50"
                      />
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={safeAmount}
                      onChange={handleAmountChange}
                      className={styles.slider}
                    />
                  </>
                )}

                {apiError && <p className={styles.apiError}>{apiError}</p>}

                <button
                  type="button"
                  onClick={isSkip ? handleSkip : handleProceedToPayment}
                  disabled={isLoading}
                  className={styles.submitBtn}
                >
                  {isLoading
                    ? 'Preparing checkout…'
                    : isSkip
                      ? 'Skip — No Contribution'
                      : `Proceed to Payment — £${safeAmount}`}
                </button>

              </motion.div>
            )}

            {/* ── STEP 3: PAYMENT ─────────────────────────────────── */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className={styles.stepBody}>
                <button type="button" onClick={() => setStep(2)} className={styles.backBtn}>← Back</button>
                <h3 className={styles.stepTitle}>Secure Payment</h3>

                {clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'flat',
                        variables: {
                          colorPrimary: '#1a1a1a',
                          colorBackground: '#ffffff',
                          colorText: '#1a1a1a',
                          colorDanger: '#991b1b',
                          fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
                          borderRadius: '0px',
                        },
                        rules: {
                          '.Input': { border: '1px solid #d8d2cc', boxShadow: 'none' },
                          '.Input:focus': { border: '1px solid #1a1a1a' },
                        },
                      },
                    }}
                  >
                    <CheckoutForm amount={safeAmount} onSuccess={handlePaymentSuccess} />
                  </Elements>
                ) : (
                  <div className={styles.loadingState}>Preparing secure checkout…</div>
                )}
              </motion.div>
            )}

            {/* ── STEP 4: CONFIRMED ───────────────────────────────── */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className={styles.successBody}>
                <div className={styles.successIcon} aria-hidden="true">
                  <CheckCircle size={32} />
                </div>

                <h3 className={styles.stepTitle}>You&apos;re booked in!</h3>

                <p className={styles.successMeta}>
                  {programme.title} &middot; {programme.day} &middot; {programme.timeStr}
                </p>

                <p className={styles.successText}>
                  {skipped
                    ? 'See you there! Feel free to contribute next time.'
                    : `Thank you for your £${safeAmount} contribution. It goes directly to keeping this programme running.`}
                </p>

                <Link href="/programmes" className={styles.backToListBtn}>
                  Back to Programmes
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
