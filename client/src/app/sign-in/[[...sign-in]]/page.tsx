import { SignIn } from "@clerk/nextjs";

/**
 * Custom sign-in page.
 * Clerk renders its hosted <SignIn /> component here.
 * The [[...sign-in]] catch-all segment is required by Clerk to handle
 * all internal redirect steps (e.g. factor-one, factor-two, SSO callbacks).
 *
 * Configured via NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in in .env
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <SignIn />
    </div>
  );
}
