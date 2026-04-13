"use client";
import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function StripeCheckoutForm({ amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return; // Stripe hasn't loaded yet

    setIsProcessing(true);

    // This tells Stripe to securely process the card in the iframe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Prevents automatic page redirect so we can show a success message
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setIsProcessing(false);
      onSuccess(); // Tell the parent component the payment worked!
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* PaymentElement is the magic Stripe iframe */}
      <PaymentElement /> 
      
      {errorMessage && <div className="text-red-500 mt-4 text-sm">{errorMessage}</div>}
      
      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full py-3 mt-6 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50"
      >
        {isProcessing ? "Processing Securely..." : `Pay £${amount} Now`}
      </button>
    </form>
  );
}