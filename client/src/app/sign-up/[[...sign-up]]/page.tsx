import { SignUp } from "@clerk/nextjs";

/**
 * Custom sign-up page.
 * Clerk renders its hosted <SignUp /> component here.
 * The [[...sign-up]] catch-all segment is required by Clerk to handle
 * all internal redirect steps (e.g. email verification, SSO callbacks).
 *
 * Configured via NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up in .env
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <SignUp />
    </div>
  );
}
