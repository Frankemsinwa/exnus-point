"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center">
            <span className="font-bold">EXNUS POINTS</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
