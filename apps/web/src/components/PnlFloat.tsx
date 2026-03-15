import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

export function PnlFloat() {
  const recentCloses = useGameStore((s) => s.recentCloses);
  const clearRecentClose = useGameStore((s) => s.clearRecentClose);

  return (
    <div style={styles.container}>
      <AnimatePresence>
        {recentCloses.map((close) => {
          const isWin = close.pnl > 0;
          const display = isWin
            ? `+$${close.pnl.toFixed(2)}`
            : `-$${Math.abs(close.pnl).toFixed(2)}`;

          return (
            <motion.div
              key={`${close.cellId}-${close.timestamp}`}
              initial={{ opacity: 1, y: 0, scale: 1, x: close.x }}
              animate={{ opacity: 0, y: -80, scale: 1.3 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              onAnimationComplete={() => clearRecentClose(close.cellId)}
              style={{
                ...styles.float,
                top: close.y,
                color: isWin ? "var(--green)" : "var(--red)",
                textShadow: isWin
                  ? "0 0 10px var(--green), 0 0 20px rgba(57, 255, 20, 0.5)"
                  : "0 0 10px var(--red), 0 0 20px rgba(255, 51, 51, 0.5)",
              }}
            >
              {display}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 100,
  },
  float: {
    position: "absolute",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "1.5rem",
    fontWeight: 900,
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
    pointerEvents: "none",
  },
};
