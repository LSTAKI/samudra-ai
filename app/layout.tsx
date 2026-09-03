import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import StatusDrawer from '@/components/StatusDrawer';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Samudra AI — Ocean Intelligence',
  description: 'Samudra AI — Ocean intelligence for marine conditions, hazards, ocean data and decision support.',
  icons: [{ rel: 'icon', url: '/logo.png' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-canvas text-primary-text font-sans selection:bg-orca-blue selection:text-white overflow-hidden">
        {/* Global 64px Fixed Navigation */}
        <Navigation />

        {/* Core Content Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
          {children}
        </main>

        {/* Global Status Drawer */}
        <StatusDrawer />
      </body>
    </html>
  );
}
