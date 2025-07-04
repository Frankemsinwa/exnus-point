"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { MiningCard } from '@/components/dashboard/mining-card';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { getDashboardData } from './actions';
import type { User } from '@/lib/db';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = {
  totalPointsMined: number;
  activeMiners: number;
  userRank: number;
}

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      getDashboardData(publicKey.toBase58()).then(data => {
        if (data) {
          setUser(data.user);
          setStats(data.stats);
        }
        setLoading(false);
      });
    }
  }, [publicKey]);

  const setBalance = (newBalance: number) => {
      if(user && stats) {
          const pointsDifference = newBalance - user.points;
          setUser({...user, points: newBalance});
          setStats({
              ...stats,
              totalPointsMined: stats.totalPointsMined + pointsDifference
          });
      }
  }

  if (loading) {
      return (
          <>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="lg:col-span-4 h-[400px]" />
                <Skeleton className="lg:col-span-3 h-[400px]" />
            </div>
          </>
      )
  }

  if (!user || !stats) {
      return <div>Could not load user data. Please refresh the page.</div>
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <MiningCard user={user} setBalance={setBalance} />
        </div>
        <div className="lg:col-span-3">
             <StatsGrid stats={stats} />
        </div>
      </div>
    </>
  );
}
