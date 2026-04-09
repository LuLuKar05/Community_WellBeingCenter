import { Suspense } from "react";
import DonateWizard from "../../components/DonateWizard";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Donate | Community Wellbeing Center",
  description: "Support our mission to provide accessible wellbeing resources.",
};

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-20 px-6">
      {/* We wrap the wizard in Suspense so Next.js can safely read the URL queries */}
      <Suspense
        fallback={
          <div className="flex justify-center mt-32">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <DonateWizard />
      </Suspense>
    </main>
  );
}
