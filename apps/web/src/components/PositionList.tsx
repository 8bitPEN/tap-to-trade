import { useGameStore } from "../store/gameStore";

export function PositionList() {
  const openPositions = useGameStore((s) => s.openPositions);
  const currentPrice = useGameStore((s) => s.currentPrice);

  const positions = Array.from(openPositions.values());

  if (positions.length === 0) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerText}>OPEN POSITIONS</span>
        <span style={styles.count}>{positions.length}</span>
      </div>

      <div style={styles.list}>
        {positions.map((pos) => {
          const isLong = pos.direction === "long";
          const pnl = isLong
            ? (currentPrice - pos.entryPrice) * pos.size
            : (pos.entryPrice - currentPrice) * pos.size;
          const isProfit = pnl >= 0;

          return (
            <div key={pos.cellId} style={styles.row}>
              <span
                style={{
                  ...styles.direction,
                  color: isLong ? "var(--cyan)" : "var(--pink)",
                }}
              >
                {isLong ? "\u2191 LONG" : "\u2193 SHORT"}
              </span>

              <span style={styles.entry}>
                @ {pos.entryPrice.toFixed(2)}
              </span>

              <span
                style={{
                  ...styles.pnl,
                  color: isProfit ? "var(--green)" : "var(--red)",
                }}
              >
                {isProfit ? "+" : ""}${pnl.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: "12px",
    left: "12px",
    zIndex: 30,
    background: "rgba(13, 13, 20, 0.95)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    padding: "10px",
    minWidth: "240px",
    maxHeight: "200px",
    overflowY: "auto",
    backdropFilter: "blur(8px)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "8px",
    borderBottom: "1px solid var(--border)",
    marginBottom: "6px",
  },
  headerText: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "var(--text-dim)",
    letterSpacing: "0.1em",
  },
  count: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "var(--cyan)",
    background: "rgba(0, 240, 255, 0.1)",
    padding: "2px 6px",
    borderRadius: "3px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 6px",
    borderRadius: "3px",
    background: "rgba(255, 255, 255, 0.02)",
  },
  direction: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.7rem",
    fontWeight: 700,
    minWidth: "70px",
  },
  entry: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.7rem",
    color: "var(--text-dim)",
    flex: 1,
  },
  pnl: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.75rem",
    fontWeight: 700,
    textAlign: "right",
  },
};
