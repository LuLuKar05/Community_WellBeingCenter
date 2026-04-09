'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import styles from './DonateWizard.module.css';

export default function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Disabled until PaymentElement fires onReady — prevents the
  // RuntimeIntegrationError that occurs when confirmPayment() is
  // called before the Stripe iframe has fully initialised.
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Stay on page — no redirect unless 3DS is needed
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      setIsProcessing(false);
      onSuccess(); // Advance wizard to step 4 (success screen)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement onReady={() => setIsReady(true)} />

      {errorMessage && (
        <p className={styles.apiError} role="alert" style={{ marginTop: '1rem' }}>
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || !isReady || isProcessing}
        className={styles.submitBtn}
        style={{ marginTop: '1.5rem' }}
      >
        {isProcessing ? 'Processing…' : `Complete £${amount} Donation`}
      </button>
    </form>
  );
}
