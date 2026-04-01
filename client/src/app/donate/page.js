import DonationFlow from "../../components/DonationFlow";
// (Optional: import Image from 'next/image' if you want to use Next's image optimization)

export const metadata = {
  title: "Donate | Community Wellbeing Center",
};

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Column: Emotional Anchor */}
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold tracking-wide uppercase">
            Support Our Mission
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Fuel Your <br />
            <span className="text-blue-600">Community.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            As a non-profit, we rely on your generosity to keep our doors open,
            our programs running, and our sliding-scale model accessible to
            everyone.
          </p>

          <div className="pt-4 flex items-center gap-4 text-sm text-gray-500 font-medium border-t border-gray-200">
            <span className="flex items-center gap-1">🔒 Secure Checkout</span>
            <span className="flex items-center gap-1">
              📄 Registered Charity
            </span>
          </div>
        </div>

        {/* Right Column: The Interactive Component */}
        <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
          <DonationFlow />
        </div>
      </div>
    </div>
  );
}
