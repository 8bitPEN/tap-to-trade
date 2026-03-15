import { useState, useEffect, useCallback } from "react";
import { queryAccount } from "../services/api";
import { useGameStore } from "../store/gameStore";

interface BulkMargin {
  totalBalance: number;
  availableBalance: number;
  marginUsed: number;
  notional: number;
  realizedPnl: number;
  unrealizedPnl: number;
  fees: number;
  funding: number;
}

interface BulkAccountInfo {
  margin: BulkMargin;
  positions: unknown[];
  openOrders: unknown[];
}

const POLL_INTERVAL = 10_000; // poll every 10 seconds

export function useBulkAccount() {
  const [account, setAccount] = useState<BulkAccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const walletAddress = useGameStore((s) => s.walletAddress);

  const fetchAccount = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const raw = await queryAccount({ type: "fullAccount", user: walletAddress }) as
        | Array<{ fullAccount: BulkAccountInfo }>
        | { fullAccount: BulkAccountInfo };
      // Bulk API returns [{ fullAccount: { margin, positions, openOrders, leverageSettings } }]
      const entry = Array.isArray(raw) ? raw[0]?.fullAccount : raw.fullAccount;
      if (entry) setAccount(entry);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch account";
      setError(message);
      console.error("[useBulkAccount]", message);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchAccount();
    const interval = setInterval(fetchAccount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAccount]);

  return { account, loading, error, refetch: fetchAccount };
}
