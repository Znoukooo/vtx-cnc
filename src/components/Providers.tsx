'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Mencegah SessionProvider mengevaluasi URL kosong/invalid saat SSR/prerender build
  return (
    <SessionProvider basePath="/api/auth">
      {children}
    </SessionProvider>
  );
}