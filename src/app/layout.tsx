import React from 'react';
import './globals.css';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import Providers from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'AppForge Studio',
  description: 'Metadata-driven dynamic application generator engine',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900 selection:bg-neutral-900 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
