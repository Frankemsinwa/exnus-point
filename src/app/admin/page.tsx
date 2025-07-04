"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getAdminData } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/db';

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminData().then(data => {
            setUsers(data.users);
            setLoading(false);
        });
    }, []);

    const handleDownloadSnapshot = () => {
        const dataStr = JSON.stringify(users, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'exnus_points_snapshot.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    if (loading) {
        return (
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
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">A complete overview of all user data.</p>
                </div>
                <Button onClick={handleDownloadSnapshot}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Snapshot
                </Button>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>User Data</CardTitle>
                    <CardDescription>{users.length} users found in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Public Key</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                                <TableHead className="text-right">Referred Users</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? users.map((user) => (
                                <TableRow key={user.publicKey}>
                                    <TableCell className="font-mono">{user.username}</TableCell>
                                    <TableCell className="font-mono text-xs">{user.publicKey}</TableCell>
                                    <TableCell className="text-right font-semibold">{user.points.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{user.referredUsersCount}</TableCell>
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
