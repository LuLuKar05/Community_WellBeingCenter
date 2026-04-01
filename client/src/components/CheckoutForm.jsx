'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

export default function CheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return; // Stripe hasn't loaded yet

    setIsProcessing(true);
    setErrorMessage(null);

    // Confirm the payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Prevents automatic page reload
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setIsProcessing(false);
      onSuccess(); // Tell the parent component it worked!
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <button
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
      >
        {isProcessing ? (
          <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Processing...</>
        ) : (
          `Donate £${amount} Securely`
        )}
      </button>
    </form>
  );
}