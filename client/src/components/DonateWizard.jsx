'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckCircle } from 'lucide-react';
import CheckoutForm from './CheckoutForm';
import styles from './DonateWizard.module.css';

// ─── Static left panel ────────────────────────────────────────────────────────
const LeftPanel = ({ safeAmount, impactSessions }) => (
  <aside className={styles.leftPanel}>
    <div className={styles.giantText}>HEAL</div>
    <div className={styles.textContent}>
      <h2 className={styles.headline}>
        A foundation for <br />
        <span className={styles.headlineHighlight}>collective</span> growth.
      </h2>
      <p className={styles.description}>
        By investing in our wellbeing center you are directly funding therapy
        programmes, holistic workshops, and community outreach initiatives
        that keep our neighbourhood thriving.
      </p>
      {safeAmount > 0 && (
        <p className={styles.impactEcho}>
          Your £{safeAmount} gift could fund {impactSessions} peer support
          session{impactSessions !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  </aside>
);

// Stripe must be initialised outside the component so it is never recreated on re-renders
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PRESET_AMOUNTS = [25, 50, 100];

// Slide animation shared by all steps
const slideVariants = {
  enter: { x: 24, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -24, opacity: 0 },
};

export default function DonateWizard() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [userDetails, setUserDetails] = useState({ firstName: '', lastName: '', email: '' });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // If the user arrives from a home-page preset button (?amount=X), pre-fill the
  // amount and jump directly to step 2 (details) — skipping the amount picker.
  useEffect(() => {
    const urlAmount = parseInt(searchParams.get('amount'));
    if (urlAmount > 0) {
      setAmount(urlAmount);
      setStep(2); // Skip step 1 — amount is already chosen
    }
  }, [searchParams]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const safeAmount = amount === '' ? 0 : Number(amount);
  const impactSessions = Math.floor(safeAmount / 5);

  const handleAmountChange = (e) => {
    if (e.target.value === '') { setAmount(''); return; }
    const val = parseInt(e.target.value) || 0;
    setAmount(val > 1000 ? 1000 : val);
  };

  // ── Step 2 → 3: create PaymentIntent ─────────────────────────────────────────
  const handleProceedToPayment = async () => {
    if (!userDetails.email || (!isAnonymous && !userDetails.firstName)) {
      setApiError('Please fill in your name and email address.');
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const res = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: safeAmount,
          frequency: 'one-time',
          email: userDetails.email,
          firstName: isAnonymous ? '' : userDetails.firstName,
          lastName: isAnonymous ? '' : userDetails.lastName,
          isAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || 'Payment could not be initialised. Please try again.');
        return;
      }

      setClientSecret(data.clientSecret);
      setStep(3);
    } catch {
      setApiError('Unable to reach the payment server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <section className={styles.section}>

      {/* ── Left: original editorial panel ──────────────────────────────── */}
      <LeftPanel safeAmount={safeAmount} impactSessions={impactSessions} />

      {/* ── Right: wizard card ───────────────────────────────────────────── */}
      <div className={styles.wizardWrapper}>
        <div className={styles.wizardCard}>

          {/* Progress bar — 3 segments (step 4 = success, all filled) */}
          <div className={styles.progress} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={`${styles.progressStep} ${step >= n ? styles.active : ''}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: AMOUNT ────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }} className={styles.stepBody}>
                <h3 className={styles.stepTitle}>Give Today</h3>

                <div className={styles.presetGrid}>
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`${styles.radioBtn} ${amount === preset ? styles.radioBtnActive : ''}`}
                      aria-pressed={amount === preset}
                    >
                      £{preset}
                    </button>
                  ))}
                </div>

                <div className={styles.inputContainer}>
                  <span className={styles.inputPrefix}>£</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    className={styles.inputField}
                    placeholder="Custom amount"
                    aria-label="Custom donation amount"
                  />
                </div>

                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={safeAmount}
                  onChange={handleAmountChange}
                  className={styles.slider}
                  aria-label="Donation amount slider"
                />

                <p className={styles.impactText}>
                  {safeAmount > 0
                    ? `Your £${safeAmount} gift could fund ${impactSessions} peer support session${impactSessions !== 1 ? 's' : ''}.`
                    : 'Select or enter an amount to see your impact.'}
                </p>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={styles.submitBtn}
                  disabled={safeAmount === 0}
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: DETAILS ───────────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }} className={styles.stepBody}>
                <button type="button" onClick={() => setStep(1)} className={styles.backBtn}>← Back to amount</button>
                <h3 className={styles.stepTitle}>Your Details</h3>

                {!isAnonymous && (
                  <div className={styles.nameGrid}>
                    <div className={styles.inputContainer}>
                      <input
                        type="text"
                        className={styles.inputField}
                        style={{ paddingLeft: '1rem' }}
                        placeholder="First Name"
                        value={userDetails.firstName}
                        onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.inputContainer}>
                      <input
                        type="text"
                        className={styles.inputField}
                        style={{ paddingLeft: '1rem' }}
                        placeholder="Last Name"
                        value={userDetails.lastName}
                        onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.inputContainer}>
                  <input
                    type="email"
                    className={styles.inputField}
                    style={{ paddingLeft: '1rem' }}
                    placeholder="Email Address"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                    required
                  />
                </div>

                <label className={styles.anonymousToggle}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) setUserDetails((d) => ({ ...d, firstName: '', lastName: '' }));
                    }}
                  />
                  <div className={styles.toggleText}>
                    <strong>Donate anonymously</strong>
                    <p>Your name will be kept private — we still need your email for your receipt.</p>
                  </div>
                </label>

                {apiError && <p className={styles.apiError}>{apiError}</p>}

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? 'Preparing checkout…' : `Proceed to Payment — £${safeAmount}`}
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: PAYMENT ───────────────────────────────────────── */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }} className={styles.stepBody}>
                <button type="button" onClick={() => setStep(2)} className={styles.backBtn}>← Back to details</button>
                <h3 className={styles.stepTitle}>Secure Payment</h3>

                {clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'flat',
                        variables: {
                          colorPrimary: '#111827',
                          colorBackground: '#ffffff',
                          colorText: '#111827',
                          colorDanger: '#991b1b',
                          fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
                          borderRadius: '0.75rem',
                        },
                        rules: {
                          '.Input': { border: '1px solid #D1D5DB', boxShadow: 'none' },
                          '.Input:focus': { border: '1px solid #111827' },
                        },
                      },
                    }}
                  >
                    <CheckoutForm amount={safeAmount} onSuccess={() => setStep(4)} />
                  </Elements>
                ) : (
                  <div className={styles.loadingState}>Preparing secure checkout…</div>
                )}
              </motion.div>
            )}

            {/* ── STEP 4: SUCCESS ───────────────────────────────────────── */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }} className={styles.successBody}>
                <div className={styles.successIcon} aria-hidden="true">
                  <CheckCircle size={32} />
                </div>
                <h3 className={styles.stepTitle}>
                  {isAnonymous ? 'Thank you.' : `Thank you, ${userDetails.firstName}.`}
                </h3>
                <p className={styles.successText}>
                  Your £{safeAmount} gift has been received. Because of you, our community is a little stronger today.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </section>
  );
}
