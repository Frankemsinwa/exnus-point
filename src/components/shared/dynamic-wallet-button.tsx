
"use client";

import dynamic from 'next/dynamic';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { 
        ssr: false,
        loading: () => <Skeleton className="h-10 w-36 rounded-md" />
    }
);

export function DynamicWalletButton(props: React.ComponentProps<typeof WalletMultiButtonDynamic>) {
    return <WalletMultiButtonDynamic {...props} />;
}
