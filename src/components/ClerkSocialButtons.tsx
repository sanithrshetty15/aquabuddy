"use client";

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { isClerkEnabled } from '@/lib/clerk';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export function ClerkSocialButtons() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const { login } = useAuth();

  // Conditionally initialize Clerk hook if enabled
  const clerkSignIn = isClerkEnabled() ? useSignIn() : null;

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (provider === 'google') setLoadingGoogle(true);
    else setLoadingGithub(true);

    try {
      if (clerkSignIn && isClerkEnabled()) {
        const { signIn, isLoaded } = clerkSignIn;
        if (!isLoaded) return;
        
        await signIn.authenticateWithRedirect({
          strategy: provider === 'google' ? 'oauth_google' : 'oauth_github',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/dashboard',
        });
      } else {
        // Fallback offline mock login for local testing
        await new Promise(r => setTimeout(r, 1200));
        
        // Log in with a mock social account email based on provider
        await login({
          email: provider === 'google' ? 'googleuser@aquabuddy.com' : 'githubuser@aquabuddy.com',
          password: 'Password123!!', // standard seeded pwd
          mockSocial: 'true'
        });
      }
    } catch (err) {
      console.error(`OAuth login error with ${provider}:`, err);
      alert(`OAuth login failed with ${provider}. Please try email login.`);
    } finally {
      setLoadingGoogle(false);
      setLoadingGithub(false);
    }
  };

  return (
    <div className="space-y-3 mt-6">
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-white/10 w-full" />
        <span className="absolute bg-[#111111] px-3 text-xs uppercase tracking-wider text-gray-500 font-light">or continue with</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Google Login */}
        <button
          type="button"
          onClick={() => void handleOAuth('google')}
          disabled={loadingGoogle || loadingGithub}
          className="flex items-center justify-center gap-2.5 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          {loadingGoogle ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              width={16}
              height={16}
              className="w-4 h-4"
              unoptimized
            />
          )}
          Google
        </button>

        {/* GitHub Login */}
        <button
          type="button"
          onClick={() => void handleOAuth('github')}
          disabled={loadingGoogle || loadingGithub}
          className="flex items-center justify-center gap-2.5 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
        >
          {loadingGithub ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Image
              src="https://www.svgrepo.com/show/512317/github-142.svg"
              alt="GitHub logo"
              width={16}
              height={16}
              className="w-4 h-4 invert"
              unoptimized
            />
          )}
          GitHub
        </button>
      </div>
    </div>
  );
}
