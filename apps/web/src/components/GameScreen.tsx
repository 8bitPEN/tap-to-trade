import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { connectWs, disconnectWs } from "../services/ws";
import { initWasm } from "../services/signing";
import { verifyAuth } from "../services/api";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import { useGameLoop } from "../hooks/useGameLoop";
import { AccountBar } from "./AccountBar";
import { Chart } from "./Chart";
import { PositionList } from "./PositionList";
import { PnlFloat } from "./PnlFloat";
import { Leaderboard } from "./Leaderboard";

export function GameScreen() {
  const { getAccessToken, user } = usePrivy();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const setWalletAddress = useGameStore((s) => s.setWalletAddress);
  const setUser = useAuthStore((s) => s.setUser);

  // Initialize game loop
  useGameLoop();

  useEffect(() => {
    connectWs();
    initWasm();

    return () => {
      disconnectWs();
    };
  }, []);

  // Extract wallet address from Privy user
  const walletAddress = (() => {
    if (!user) return null;
    const privyUser = user as unknown as Record<string, unknown>;
    const wallet = privyUser.wallet as { address?: string } | undefined;
    if (wallet?.address) return wallet.address;
    const linked = (privyUser.linkedAccounts ?? []) as Array<{ type?: string; address?: string }>;
    const solWallet = linked.find(
      (a) => a.type === "wallet" || a.type === "solana_wallet",
    );
    return solWallet?.address ?? null;
  })();

  useEffect(() => {
    if (walletAddress) setWalletAddress(walletAddress);
  }, [walletAddress, setWalletAddress]);

  // Authenticate with backend
  useEffect(() => {
    async function authenticate() {
      if (!walletAddress) return;
      try {
        const token = await getAccessToken();
        if (token) {
          const result = await verifyAuth(token, walletAddress);
          if (result.user) {
            setUser(result.user as import("@tap-to-trade/shared").User);
          }
        }
      } catch (err) {
        console.error("[auth] verification failed:", err);
      }
    }

    authenticate();
  }, [getAccessToken, walletAddress, setUser]);

  return (
    <div style={styles.container}>
      <AccountBar />

      <div style={styles.main}>
        <Chart />
      </div>

      <PositionList />

      <PnlFloat />

      <button
        style={styles.leaderboardToggle}
        onClick={() => setShowLeaderboard((prev) => !prev)}
        title="Leaderboard"
      >
        LB
      </button>

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
    position: "relative",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  leaderboardToggle: {
    position: "fixed",
    top: "60px",
    right: "12px",
    zIndex: 50,
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "8px 12px",
    border: "1px solid var(--cyan)",
    borderRadius: "4px",
    background: "rgba(0, 240, 255, 0.1)",
    color: "var(--cyan)",
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "all 0.2s ease",
  },
};
