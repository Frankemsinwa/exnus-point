"use client";

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { AppHeader } from '@/components/shared/header';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { publicKey, connecting } = useWallet();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!connecting) {
      if (publicKey && ADMIN_WALLET && publicKey.toBase58() === ADMIN_WALLET) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
      setIsLoading(false);
    }
  }, [publicKey, connecting]);

  if (isLoading || connecting) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex flex-grow flex-col items-center justify-center bg-background text-center p-4">
              <ShieldAlert className="h-16 w-16 text-destructive" />
              <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
              <p className="mt-2 text-muted-foreground">
                  You are not authorized to view this page. Please connect the admin wallet.
              </p>
          </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-grow p-4 md:p-6 lg:p-8">
            {children}
        </main>
    </div>
  );
}
