import type { Metadata, Viewport } from 'next';
import { Poppins, Boogaloo } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const boogaloo = Boogaloo({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-boogaloo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MinDora — Teman Curhat Digital',
  description: 'Aplikasi yang selalu siap mendengarkan dan membantumu melewati hari-hari berat.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A3448',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable} ${boogaloo.variable} h-full`}>
      <body className="h-full font-poppins">
        {children}
      </body>
    </html>
  );
}
