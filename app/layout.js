import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: 'QRify — Instant QR Code Generator',
  description:
    'Generate, preview, customize, and download high-resolution PNG QR codes instantly from any URL or text.',
  openGraph: {
    title: 'QRify — Instant QR Code Generator',
    description:
      'Generate, preview, customize, and download high-resolution PNG QR codes instantly from any URL or text.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QRify — Instant QR Code Generator',
    description:
      'Generate, preview, customize, and download high-resolution PNG QR codes instantly from any URL or text.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#1D4ED8]/15 selection:text-[#1D4ED8]">
        {children}
      </body>
    </html>
  );
}
