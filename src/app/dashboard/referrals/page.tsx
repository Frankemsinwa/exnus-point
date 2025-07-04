"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { getReferralPageData } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReferralsPage() {
    const { toast } = useToast();
    const { publicKey } = useWallet();
    const [data, setData] = useState<{ referralLink: string; referredUsers: number; bonusPoints: number; } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(publicKey) {
            getReferralPageData(publicKey.toBase58()).then(setData).finally(() => setLoading(false));
        }
    }, [publicKey]);

    const handleCopy = () => {
        if (!data?.referralLink) return;
        navigator.clipboard.writeText(data.referralLink);
        toast({
            title: "Copied!",
            description: "Your referral link has been copied to the clipboard.",
        });
    };
    
    if (loading) {
        return (
             <div className="space-y-6">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Referrals</h1>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full max-w-lg" />
                        <div className="grid gap-4 md:grid-cols-2 pt-4">
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!data) return <div>Could not load referral data.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Referrals</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Gift className="h-6 w-6 text-accent" />
                        Invite Friends, Earn More
                    </CardTitle>
                    <CardDescription>
                        Share your unique link to earn bonus points for every friend who joins and starts mining.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label htmlFor="referral-link" className="text-sm font-medium">Your Referral Link</label>
                        <div className="flex w-full max-w-lg items-center space-x-2 mt-2">
                            <Input id="referral-link" type="text" value={data.referralLink} readOnly />
                            <Button type="button" size="icon" onClick={handleCopy} disabled={!data.referralLink}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                        <h4 className="font-semibold text-foreground">How It Works</h4>
                        <ul className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5">
                            <li>Share your personal referral link with friends.</li>
                            <li>Your friend joins by connecting their wallet via your link.</li>
                            <li>You automatically receive <strong>100 bonus points</strong> when your referred friend activates their first mining session.</li>
                            <li>Track your referred users and total bonus points below!</li>
                        </ul>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-muted/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Referred Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{data.referredUsers.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Total friends who have joined.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Bonus Points</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{data.bonusPoints.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Total points earned from referrals.</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
