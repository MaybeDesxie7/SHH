// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { checkBetaAccess } from '../utils/checkBetaAccess';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Glimo (Beta)',
  description: 'Exclusive beta access to Glimo',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const hasBetaAccess = await checkBetaAccess();

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className={inter.className}>
        {hasBetaAccess ? (
          <>
            <div style={{ background: 'black', color: 'white', padding: '10px', textAlign: 'center' }}>
              <strong>🚀 You are using the Beta version of Glimo</strong>
            </div>
            {children}
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>🔒 Beta Access Required</h2>
            <p>This version of Glimo is currently invite-only. Please check your email for an invitation.</p>
          </div>
        )}
      </body>
    </html>
  );
}
