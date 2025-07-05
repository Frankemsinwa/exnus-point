"use client";

import Link from "next/link";
import { DynamicWalletButton } from "./dynamic-wallet-button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="font-bold">EXNUS POINTS</span>
        </Link>
        <DynamicWalletButton />
      </div>
    </header>
  );
}
