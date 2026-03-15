import { usePrivy } from "@privy-io/react-auth";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/authStore";
import { useBulkAccount } from "../hooks/useBulkAccount";

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function AccountBar() {
  const { logout } = usePrivy();
  const walletAddress = useGameStore((s) => s.walletAddress);
  const isConnected = useGameStore((s) => s.isConnected);
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const { account } = useBulkAccount();

  const handleLogout = async () => {
    clearUser();
    await logout();
  };

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        {user?.twitterAvatar && (
          <img src={user.twitterAvatar} alt="" style={styles.avatar} />
        )}
        <span style={styles.handle}>
          {user?.twitterHandle ? `@${user.twitterHandle}` : "Anon"}
        </span>

        <div style={styles.separator} />

        {walletAddress && (
          <span style={styles.wallet}>{truncateAddress(walletAddress)}</span>
        )}

        <div style={styles.separator} />

        <span style={styles.balance}>
          {account ? `$${account.margin.totalBalance.toFixed(2)}` : "--"}
        </span>
      </div>

      <div style={styles.right}>
        <span
          style={{
            ...styles.status,
            color: isConnected ? "var(--green)" : "var(--red)",
          }}
        >
          {isConnected ? "LIVE" : "OFFLINE"}
        </span>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          LOGOUT
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px",
    background: "#0d0d14",
    borderBottom: "1px solid var(--border)",
    zIndex: 20,
    minHeight: "48px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "1px solid var(--border)",
  },
  handle: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--text)",
  },
  separator: {
    width: "1px",
    height: "20px",
    background: "var(--border)",
  },
  wallet: {
    fontSize: "0.75rem",
    color: "var(--text-dim)",
    fontFamily: "'JetBrains Mono', monospace",
  },
  balance: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--cyan)",
    fontFamily: "'JetBrains Mono', monospace",
  },
  status: {
    fontSize: "0.7rem",
    fontWeight: 700,
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: "0.1em",
  },
  logoutBtn: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "6px 12px",
    border: "1px solid var(--text-dim)",
    borderRadius: "3px",
    background: "transparent",
    color: "var(--text-dim)",
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "all 0.15s ease",
  },
};
