import './globals.css';
import { Space_Grotesk, Inter } from 'next/font/google';

// Space Grotesk for headlines + big numbers; Inter for all body, UI, and labels.
const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

// metadataBase lets Next resolve the OG image to an absolute URL.
// Set NEXT_PUBLIC_SITE_URL to your Vercel URL in production (see .env.local.example).
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'WC26 · Matchday Intelligence',
  description: 'The 2026 FIFA World Cup is over. Spain are champions. Every match, result, report, lineup and player profile — a complete archive.',
  openGraph: {
    title: 'WC26 · Matchday Intelligence',
    description: 'Spain are world champions. Every 2026 FIFA World Cup match, result, report and lineup, in one place.',
    type: 'website',
    images: ['/og.png'],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs synchronously before first paint – prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('wc26-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
