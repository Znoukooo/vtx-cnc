import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';
import Providers from '@/components/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VTX - Velocity Tech Xperience | Custom CNC Automotive Parts',
  description: 'Katalog spesialis part modifikasi CNC presisi tinggi untuk motor harian & balap.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-red-600 selection:text-white"
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}