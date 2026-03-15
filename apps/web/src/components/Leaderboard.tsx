import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";
import type { LeaderboardEntry } from "@tap-to-trade/shared";

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getLeaderboard();
        setEntries(data.entries);
      } catch (err) {
        console.error("[leaderboard] failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, []);

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>LEADERBOARD</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            X
          </button>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : entries.length === 0 ? (
          <p style={styles.loading}>No trades yet</p>
        ) : (
          <div style={styles.list}>
            {entries.map((entry) => (
              <div key={entry.rank} style={styles.row}>
                <span style={styles.rank}>#{entry.rank}</span>

                <div style={styles.userInfo}>
                  {entry.twitterAvatar && (
                    <img
                      src={entry.twitterAvatar}
                      alt=""
                      style={styles.avatar}
                    />
                  )}
                  <span style={styles.handle}>
                    {entry.twitterHandle ?? "Anon"}
                  </span>
                </div>

                <div style={styles.stats}>
                  <span
                    style={{
                      ...styles.pnl,
                      color: entry.totalPnl >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {entry.totalPnl >= 0 ? "+" : ""}
                    ${entry.totalPnl.toFixed(2)}
                  </span>
                  <span style={styles.meta}>
                    {entry.tradeCount} trades &bull;{" "}
                    {(entry.winRate * 100).toFixed(0)}% W
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.6)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  panel: {
    width: "380px",
    maxWidth: "90vw",
    height: "100vh",
    background: "#0d0d14",
    borderLeft: "1px solid var(--border)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "12px",
    borderBottom: "1px solid var(--border)",
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--cyan)",
    letterSpacing: "0.15em",
  },
  closeBtn: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "4px 8px",
    border: "1px solid var(--text-dim)",
    borderRadius: "2px",
    background: "transparent",
    color: "var(--text-dim)",
    cursor: "pointer",
  },
  loading: {
    color: "var(--text-dim)",
    fontSize: "0.85rem",
    textAlign: "center",
    padding: "40px 0",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    background: "rgba(0, 240, 255, 0.02)",
  },
  rank: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--cyan)",
    minWidth: "36px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "1px solid var(--border)",
  },
  handle: {
    fontSize: "0.85rem",
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  stats: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "2px",
  },
  pnl: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  meta: {
    fontSize: "0.65rem",
    color: "var(--text-dim)",
  },
};
