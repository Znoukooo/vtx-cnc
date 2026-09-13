'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ClientSessionProvider = dynamic(
  () => import('next-auth/react').then((mod) => mod.SessionProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClientSessionProvider>
      {children}
    </ClientSessionProvider>
  );
}