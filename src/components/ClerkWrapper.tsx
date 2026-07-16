"use client";

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { isClerkEnabled } from '@/lib/clerk';

interface ClerkWrapperProps {
  children: React.ReactNode;
}

export function ClerkWrapper({ children }: ClerkWrapperProps) {
  if (isClerkEnabled()) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }
  return <>{children}</>;
}
