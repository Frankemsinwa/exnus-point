"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Download, Users, Gem, Gift } from 'lucide-react';
import { getAdminDashboardData } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/db';

type EnrichedUser = User & { airdropAllocation: number };

type AdminStats = {
    totalUsers: number;
    totalPoints: number;
    totalTokens: number;
}

export default function AdminPage() {
    const [users, setUsers] = useState<EnrichedUser[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminDashboardData().then(data => {
            setUsers(data.users);
            setStats(data.stats);
            setLoading(false);
        });
    }, []);

    const handleDownloadSnapshot = () => {
        const snapshotData = users.map(u => ({
            publicKey: u.publicKey,
            airdropAllocation: parseFloat(u.airdropAllocation.toFixed(4)),
        }));

        const dataStr = JSON.stringify(snapshotData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'exnus_airdrop_snapshot.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    if (loading) {
        return (
             <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[...Array(10)].map((_, i) => (
                                 <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Airdrop calculation and user data overview.</p>
                </div>
                <Button onClick={handleDownloadSnapshot}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Airdrop Snapshot
                </Button>
            </div>

            {stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Points in System</CardTitle>
                            <Gem className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tokens for Airdrop</CardTitle>
                            <Gift className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">100 Million</p>
                        </CardContent>
                    </Card>
                </div>
            )}
            
             <Card>
                <CardHeader>
                    <CardTitle>User Airdrop Allocation</CardTitle>
                    <CardDescription>{users.length} users found in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Public Key</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                                <TableHead className="text-right">Airdrop Allocation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? users.map((user) => (
                                <TableRow key={user.publicKey}>
                                    <TableCell className="font-mono">{user.username}</TableCell>
                                    <TableCell className="font-mono text-xs">{user.publicKey}</TableCell>
                                    <TableCell className="text-right font-semibold">{user.points.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-accent">{user.airdropAllocation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No users yet.
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
