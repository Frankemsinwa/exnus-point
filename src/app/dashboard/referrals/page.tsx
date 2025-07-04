"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export default function ReferralsPage() {
    const { toast } = useToast();
    const { publicKey } = useWallet();

    const referralLink = useMemo(() => {
        if (!publicKey) return "";
        return `https://exnus.points/join?ref=${publicKey.toBase58().slice(0, 8)}`;
    }, [publicKey]);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        toast({
            title: "Copied!",
            description: "Your referral link has been copied to the clipboard.",
        });
    };

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
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="referral-link" className="text-sm font-medium">Your Referral Link</label>
                        <div className="flex w-full max-w-lg items-center space-x-2 mt-2">
                            <Input id="referral-link" type="text" value={referralLink} readOnly />
                            <Button type="button" size="icon" onClick={handleCopy} disabled={!referralLink}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 pt-4">
                        <Card className="bg-muted/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Referred Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">15</p>
                                <p className="text-xs text-muted-foreground">Total friends who have joined.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Bonus Points</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">7,500</p>
                                <p className="text-xs text-muted-foreground">Total points earned from referrals.</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
