/**
 * Clerk Authentication Utilities & Fallback layer.
 */

export const isClerkEnabled = (): boolean => {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
};
