"use client";
import React from 'react';

export default function DonationSelector({ amount, setAmount, frequency, setFrequency, onProceed }) {
  const impactText = {
    10: "£10 provides a hot meal in our community cafe.",
    25: "£25 funds art supplies for one youth therapy session.",
    50: "£50 fully subsidizes a 1-on-1 mental counseling session."
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex gap-4 justify-center">
        <button 
          onClick={() => setFrequency('one-time')}
          className={`px-4 py-2 rounded ${frequency === 'one-time' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          One-Time
        </button>
        <button 
          onClick={() => setFrequency('monthly')}
          className={`px-4 py-2 rounded ${frequency === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Monthly
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[10, 25, 50].map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset)}
            className={`py-3 rounded text-lg font-bold border-2 ${amount === preset ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-600'}`}
          >
            £{preset}
          </button>
        ))}
      </div>
      
      <p className="text-center text-sm text-gray-600 italic">
        {impactText[amount] || "Every contribution strengthens our community."}
      </p>

      <button 
        onClick={onProceed}
        className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
      >
        Proceed with £{amount}
      </button>
    </div>
  );
}