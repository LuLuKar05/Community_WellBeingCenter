import EditorialDonation from "../components/home/EditorialDonation";
import ImpactStats from '../components/home/ImpactStats';
import UpcomingSessionsPreview from "../components/home/UpcomingSessionsPreview";
import PartnerGrid from "../components/home/PartnerGrid";
import Hero from "../components/home/Hero";

/**
 * Home page — publicly accessible.
 * Auth buttons live in the global <Navbar> (rendered by RootLayout),
 * so this page only needs to render its own content.
 */
export default function HomePage() {
  return (
    <main>
      {/* 1. HERO PLACEHOLDER */}
      <Hero />

      {/* 2. IMPACT STATS */}
      <ImpactStats />

      {/* 3. DONATION OVERLAP SECTION */}
      <EditorialDonation />

      {/* 4. CLASSES PREVIEW PLACEHOLDER */}
      <UpcomingSessionsPreview />

      {/* 5. PARTNER GRID */}
      <PartnerGrid />
    </main>
);
}
