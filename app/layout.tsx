import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Smart Hustle Hub',
  description: 'Make money online with smart tools and hustles.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Font Awesome 6 */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-KSoiA3j6sPlvP0E1OJCF04GE2dTPjQKkKvYVb0f0gyTx1sxWUpx5nK1/Jv/vZOPL2MP0iTzFJr4UvTSHL7++gQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* ✅ AOS animation styles */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/aos@next/dist/aos.css"
        />

        {/* ✅ Your global style.css (optional) */}
        <link rel="stylesheet" href="/style.css" />

        {/* ✅ Your global dashboard.css */}
        <link rel="stylesheet" href="/dashboard.css" />

        {/* ✅ Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:bg-[#0a0a0a] dark:text-[#ededed]`}
      >
        {children}
      </body>
    </html>
  );
}
