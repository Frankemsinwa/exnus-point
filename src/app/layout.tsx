import type {Metadata} from 'next';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'EXNUS POINTS',
  description: 'Join the EXNUS POINTS airdrop and start mining your points today!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
