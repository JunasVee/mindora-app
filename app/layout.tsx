import type { Metadata, Viewport } from 'next';
import { Poppins, Boogaloo } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-context';
import { LanguageProvider } from '@/lib/language-context';
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

// Runs before paint to set the .dark class synchronously, avoiding a
// light-mode flash for users who already chose dark.
const THEME_INIT_SCRIPT = `
  try {
    var t = localStorage.getItem('mindora_theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable} ${boogaloo.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-full font-poppins">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
