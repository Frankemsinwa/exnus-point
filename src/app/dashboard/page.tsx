
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { MiningCard } from '@/components/dashboard/mining-card';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { getDashboardData } from './actions';
import type { User } from '@/lib/db';

type Stats = {
  totalPointsMined: number;
  activeMiners: number;
  userRank: number;
}

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchDashboardData = useCallback(() => {
    if (publicKey) {
      const referralCode = sessionStorage.getItem('referralCode');
      getDashboardData(publicKey.toBase58(), referralCode).then(data => {
        if (data) {
          setUser(data.user);
          setStats(data.stats);
        }
        // Once used, remove it to prevent re-applying it on refresh
        if (referralCode) {
            sessionStorage.removeItem('referralCode');
        }
      });
    }
  }, [publicKey]);

  useEffect(() => {
      fetchDashboardData();
  }, [publicKey, fetchDashboardData]);

  const handleRewardClaimed = () => {
      fetchDashboardData();
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <MiningCard user={user} onRewardClaimed={handleRewardClaimed} />
        </div>
        <div className="lg:col-span-3">
             <StatsGrid stats={stats} />
        </div>
      </div>
    </>
  );
}
