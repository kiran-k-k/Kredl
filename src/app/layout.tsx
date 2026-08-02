import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { GlobalProvider } from '@/providers/GlobalProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  preload: false,
});

export const metadata: Metadata = {
  title: 'Kredl',
  description: 'Learn. Build. Prepare. Get Hired.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
