"use client";

import { useState } from 'react';
import { MiningCard } from '@/components/dashboard/mining-card';
import { StatsGrid } from '@/components/dashboard/stats-grid';

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <MiningCard balance={balance} setBalance={setBalance} />
        </div>
        <div className="lg:col-span-3">
             <StatsGrid />
        </div>
      </div>
    </>
  );
}
