import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * ROUTE VISIBILITY GUIDE
 * ======================
 * To make a route PUBLIC:  do NOT add it here. Public by default.
 * To make a route PROTECTED: add its pattern to isProtectedRoute below.
 *
 * Pattern syntax (uses path-to-regexp):
 *   "/admin(.*)"          → /admin and every sub-path  (e.g. /admin/users)
 *   "/programmes/:id"     → only /programmes/[id], NOT /programmes itself
 *   "/dashboard"          → exactly /dashboard only
 *   "/account(.*)"        → /account and every sub-path
 *
 * Current visibility:
 *   PUBLIC    /                  Home page
 *   PUBLIC    /donate            Donation wizard
 *   PUBLIC    /programmes        Browse & filter listing page
 *   PUBLIC    /sign-in           Clerk sign-in page
 *   PUBLIC    /sign-up           Clerk sign-up page
 *   PROTECTED /programmes/:id    Programme detail / booking page
 *   PROTECTED /admin(.*)         Admin panel (any sub-path)
 */
const isProtectedRoute = createRouteMatcher([
  "/programmes/:id",
  "/admin(.*)",
]);

/**
 * Clerk middleware runs on every request matched by `config.matcher` below.
 * For protected routes, auth.protect() automatically redirects unauthenticated
 * users to the sign-in page configured in NEXT_PUBLIC_CLERK_SIGN_IN_URL.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
