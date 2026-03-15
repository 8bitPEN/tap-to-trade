import { useState, useEffect, useCallback } from "react";
import { queryAccount } from "../services/api";
import { useGameStore } from "../store/gameStore";

interface BulkAccountInfo {
  balance: number;
  equity: number;
  positions: unknown[];
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
      const data = await queryAccount({ type: "fullAccount", user: walletAddress });
      setAccount(data);
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
