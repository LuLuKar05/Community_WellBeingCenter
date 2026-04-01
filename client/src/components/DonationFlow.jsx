'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { CheckCircle2 } from 'lucide-react';

// Initialize Stripe outside the component so it doesn't recreate on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function DonationFlow() {
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [frequency, setFrequency] = useState('monthly');
  const [amount, setAmount] = useState(25);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false); // NEW STATE
  // Dynamic Impact Text Logic
  const getImpactText = () => {
    if (amount === 10) return "£10 provides a hot meal in our community cafe.";
    if (amount === 25) return "£25 funds art supplies for one youth therapy session.";
    if (amount === 50) return "£50 fully subsidizes a 1-on-1 mental health counseling session.";
    return "Every contribution strengthens our community.";
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Talk to our Express backend!
      const res = await fetch('http://localhost:5000/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, frequency, ...formData }),
      });
      
      const data = await res.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep(2); // Move to payment step
      }
    } catch (error) {
      console.error("Failed to initialize payment", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 3: SUCCESS STATE ---
  if (step === 3) {
    return (
      <div className="text-center py-12 animate-in slide-in-from-bottom-4 duration-500">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you, {formData.firstName}!</h2>
        <p className="text-gray-600">
          Your £{amount} donation has been received. Because of you, our community is a little stronger today.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
      {/* STEP 1: DONATION DETAILS */}
      {step === 1 && (
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
          {/* Frequency Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg">
                {['one-time', 'monthly'].map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => setFrequency(type)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                    frequency === type ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {type.replace('-', ' ')}
                </button>
                ))}
            </div>

          {/* Amount Selection */}
            <div className="grid grid-cols-3 gap-3">
                {[10, 25, 50].map((preset) => (
                <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-3 rounded-lg border-2 font-semibold transition-all ${
                    amount === preset ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                >
                    £{preset}
                </button>
                ))}
            </div>
            <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md italic">
                {getImpactText()}
            </p>

          {/* User Details */}
            <div className="space-y-4">
                {/* Anonymous Checkbox */}
                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={(e) => {
                    setIsAnonymous(e.target.checked);
                    // Clear names if they check the box
                    if (e.target.checked) setFormData({ ...formData, firstName: '', lastName: '' });
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>I would like to donate anonymously</span>
                </label>

                {/* Conditionally render Name fields */}
                {!isAnonymous && (
                <div className="grid grid-cols-2 gap-4">
                    <input required={!isAnonymous} type="text" placeholder="First Name" className="p-3 border rounded-lg w-full" 
                    value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    <input required={!isAnonymous} type="text" placeholder="Last Name" className="p-3 border rounded-lg w-full" 
                    value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                )}

                {/* Email is always shown */}
                <div>
                <input required type="email" placeholder="Email Address (for tax receipt)" className="p-3 border rounded-lg w-full" 
                    onChange={e => setFormData({...formData, email: e.target.value})} />
                {isAnonymous && <p className="text-xs text-gray-500 mt-1">Your email is kept private and only used for your receipt.</p>}
                </div>
            </div>
            <input required type="email" placeholder="Email Address" className="p-3 border rounded-lg w-full" 
                onChange={e => setFormData({...formData, email: e.target.value})} />

            <button disabled={isLoading} type="submit" className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors">
                {isLoading ? 'Preparing Secure Checkout...' : 'Continue to Payment'}
            </button>
        </form>
      )}

      {/* STEP 2: STRIPE PAYMENT */}
      {step === 2 && clientSecret && (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-4 hover:text-gray-900">
            &larr; Back to details
          </button>
          {/* Elements Provider wraps the checkout form to inject Stripe context */}
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <CheckoutForm amount={amount} onSuccess={() => setStep(3)} />
          </Elements>
        </div>
      )}
    </div>
  );
}