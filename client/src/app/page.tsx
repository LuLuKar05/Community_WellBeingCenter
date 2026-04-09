import EditorialDonation from "../components/home/EditorialDonation";

/**
 * Home page — publicly accessible.
 * Auth buttons live in the global <Navbar> (rendered by RootLayout),
 * so this page only needs to render its own content.
 */
export default function HomePage() {
  return <EditorialDonation />;
}
