"use client";
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import DonationSelector from './DonationSelector';
import StripeCheckoutForm from './StripeCheckoutForm';

// Load Stripe outside of component to prevent recreation on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function DonationWidget() {
  const [amount, setAmount] = useState(25);
  const [frequency, setFrequency] = useState('monthly');
  const [clientSecret, setClientSecret] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Ask your Express backend for the secret key
  const handleCheckoutInitiation = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          frequency,
          // Hardcoding user details for this example to keep UI simple
          firstName: "Guest", lastName: "User", email: "guest@example.com" 
        }),
      });
      
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch (error) {
      console.error("Failed to initialize payment:", error);
    }
  };

  // If payment succeeds, show this
  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-green-700">Thank You!</h2>
        <p className="mt-2 text-gray-700">Your £{amount} donation was successful. Your support means the world to our community.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Step 1: Show the UI to select amount */}
      {!clientSecret && (
        <DonationSelector 
          amount={amount} 
          setAmount={setAmount} 
          frequency={frequency} 
          setFrequency={setFrequency}
          onProceed={handleCheckoutInitiation}
        />
      )}

      {/* Step 2: Show the Stripe Form securely wrapped in the Elements provider */}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripeCheckoutForm 
            amount={amount} 
            onSuccess={() => setIsSuccess(true)} 
          />
        </Elements>
      )}
    </div>
  );
}