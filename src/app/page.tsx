
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AppHeader } from '@/components/shared/header';
import { AppFooter } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Gift, Zap } from 'lucide-react';

export default function Home() {
  const { connected } = useWallet();
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
      router.push('/dashboard');
    }
  }, [connected, router]);

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
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-grid-white/[0.05]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                  Welcome to EXNUS POINTS
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  The future of decentralized rewards. Connect your wallet, complete simple tasks, and start mining points for the upcoming airdrop.
                </p>
              </div>
              <div className="space-x-4 pt-6">
                <WalletMultiButton style={{}} />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-secondary border-none transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent/10">
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

        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
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
               <WalletMultiButton style={{ width: '100%' }} />
            </div>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
