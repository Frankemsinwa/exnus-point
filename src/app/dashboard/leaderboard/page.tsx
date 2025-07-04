"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getLeaderboardPageData } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardEntry = {
    rank: number;
    user: string;
    points: string;
}

const rankColors: { [key: number]: string } = {
    1: "bg-amber-400 text-amber-900",
    2: "bg-slate-300 text-slate-800",
    3: "bg-orange-400 text-orange-900",
}

export default function LeaderboardPage() {
    const { publicKey } = useWallet();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (publicKey) {
            getLeaderboardPageData(publicKey.toBase58())
                .then(data => {
                    setLeaderboard(data.leaderboard);
                })
                .finally(() => setLoading(false));
        } else {
           // Handle case where wallet is not connected but page is accessed
           setLoading(false);
        }
    }, [publicKey]);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Leaderboard</h1>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-2">
                                    <Skeleton className="h-6 w-12 rounded-full" />
                                    <Skeleton className="h-6 flex-1" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold md:text-2xl font-headline">Leaderboard</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Trophy className="h-6 w-6 text-accent" />
            Top Miners
          </CardTitle>
          <CardDescription>
            See who is leading the charge in the EXNUS POINTS airdrop event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.length > 0 ? leaderboard.sort((a,b) => a.rank - b.rank).map((entry) => (
                <TableRow key={entry.rank} className={entry.user.includes('(You)') ? 'bg-accent/20' : ''}>
                  <TableCell className="font-medium">
                    <Badge variant="secondary" className={`text-base ${rankColors[entry.rank] || ''}`}>{entry.rank}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{entry.user}</TableCell>
                  <TableCell className="text-right font-semibold">{entry.points}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center">
                        No data to display. Connect your wallet to see the leaderboard.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
