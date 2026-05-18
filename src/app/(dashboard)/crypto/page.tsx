import type { Metadata } from "next";
import { getCryptoMarkets, getFearGreedIndex, getGlobalCryptoData } from "@/lib/market-data";
import { CryptoTable } from "./_components/crypto-table";
import { GlobalStats } from "./_components/global-stats";

export const metadata: Metadata = { title: "Crypto Dashboard" };
export const revalidate = 60;

export default async function CryptoPage() {
  const [coins, fearGreed] = await Promise.allSettled([
    getCryptoMarkets(1, 50),
    getFearGreedIndex(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">Crypto Dashboard</h1>
        <p className="text-muted text-sm mt-1">Live cryptocurrency market data — updated every minute</p>
      </div>
      <GlobalStats
        fearGreed={fearGreed.status === "fulfilled" ? fearGreed.value : null}
      />
      <CryptoTable
        initialCoins={coins.status === "fulfilled" ? coins.value : []}
      />
    </div>
  );
}
