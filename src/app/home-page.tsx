
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { AppHeader } from '@/components/shared/header';
import { AppFooter } from '@/components/shared/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Gift, Zap, Loader2 } from 'lucide-react';
import { DynamicWalletButton } from '@/components/shared/dynamic-wallet-button';

export default function HomePage() {
  const { connected, connecting } = useWallet();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      sessionStorage.setItem('referralCode', refCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (connected) {
      const redirectPath = sessionStorage.getItem('redirectPath');
      if (redirectPath && redirectPath.startsWith('/dashboard')) {
        sessionStorage.removeItem('redirectPath');
        router.push(redirectPath);
      } else {
        router.push('/dashboard');
      }
    }
  }, [connected, router]);

  // Show a loading/redirecting screen if the wallet is connecting or already connected.
  // This prevents the homepage content from flashing for returning users.
  if (connecting || connected) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="mt-4 text-muted-foreground">
              {connecting ? 'Connecting to wallet...' : 'Redirecting to dashboard...'}
            </p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  // Render the full homepage for new/disconnected users.
  const features = [
    {
      icon: <Gift className="h-8 w-8 text-accent" />,
      title: 'Fair Airdrop',
      description: 'Points are distributed based on your mining activity. Everyone gets a fair chance.',
    },
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: 'Daily Mining',
      description: 'Activate your mining session every 24 hours to earn a consistent stream of points.',
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-accent" />,
      title: 'Simple Tasks',
      description: 'Complete easy one-time tasks to unlock your mining capabilities and boost your rewards.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-grow">
        <section className="relative w-full bg-hero-background bg-cover bg-center py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-grid-white/[0.05]" />
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                  Welcome to EXNUS POINTS
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The future of decentralized rewards. Connect your wallet, complete simple tasks, and start mining points for the upcoming airdrop.
                </p>
              </div>
              <div className="space-x-4 pt-6">
                <DynamicWalletButton style={{}} />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {features.map((feature) => (
                <Card key={feature.title} className="transform border-none bg-secondary transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent/10">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-secondary py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Ready to Join the Revolution?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Don't miss out on your chance to be part of the EXNUS ecosystem. The earlier you start, the more you earn.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <DynamicWalletButton style={{ width: '100%' }} />
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
