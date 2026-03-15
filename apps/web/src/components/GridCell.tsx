import { useCallback } from "react";
import { useGameStore } from "../store/gameStore";
import { GRID_LEVELS } from "@tap-to-trade/shared";
import type { Direction } from "@tap-to-trade/shared";

interface GridCellProps {
  cellId: string;
  priceLevel: number;
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
}

export function GridCell({ cellId, priceLevel, x, y, width, height, row }: GridCellProps) {
  const cellState = useGameStore((s) => s.gridCells.get(cellId));
  const currentPrice = useGameStore((s) => s.currentPrice);
  const tapCell = useGameStore((s) => s.tapCell);

  const status = cellState?.status ?? "empty";

  // Above current price midpoint = long, below = short
  const midRow = GRID_LEVELS / 2;
  const direction: Direction = row < midRow ? "long" : "short";

  const handleClick = useCallback(() => {
    if (status !== "empty") return;
    tapCell(cellId, priceLevel, direction, currentPrice);
  }, [cellId, priceLevel, direction, currentPrice, status, tapCell]);

  const cellStyle = getCellStyle(status, x, y, width, height);

  return (
    <div
      style={cellStyle}
      onClick={handleClick}
      title={`${direction.toUpperCase()} @ ${priceLevel}`}
    >
      {status === "open-long" && <span style={styles.arrow}>&#x2191;</span>}
      {status === "open-short" && <span style={styles.arrow}>&#x2193;</span>}
    </div>
  );
}

function getCellStyle(
  status: string,
  x: number,
  y: number,
  width: number,
  height: number,
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    pointerEvents: "auto",
    cursor: status === "empty" ? "pointer" : "default",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: 700,
    transition: "background 0.15s ease, box-shadow 0.15s ease",
    borderRadius: "2px",
  };

  switch (status) {
    case "empty":
      return {
        ...base,
        border: "1px solid rgba(0, 240, 255, 0.08)",
        background: "transparent",
      };
    case "open-long":
      return {
        ...base,
        border: "1px solid var(--cyan)",
        background: "rgba(0, 240, 255, 0.12)",
        boxShadow: "0 0 12px rgba(0, 240, 255, 0.3), inset 0 0 8px rgba(0, 240, 255, 0.1)",
        animation: "pulse-cyan 1.5s ease-in-out infinite",
        color: "var(--cyan)",
      };
    case "open-short":
      return {
        ...base,
        border: "1px solid var(--pink)",
        background: "rgba(255, 45, 120, 0.12)",
        boxShadow: "0 0 12px rgba(255, 45, 120, 0.3), inset 0 0 8px rgba(255, 45, 120, 0.1)",
        animation: "pulse-pink 1.5s ease-in-out infinite",
        color: "var(--pink)",
      };
    case "closing-win":
      return {
        ...base,
        border: "1px solid var(--green)",
        background: "rgba(57, 255, 20, 0.2)",
        animation: "flash-green 0.5s ease-out",
        color: "var(--green)",
      };
    case "closing-loss":
      return {
        ...base,
        border: "1px solid var(--red)",
        background: "rgba(255, 51, 51, 0.2)",
        animation: "flash-red 0.5s ease-out",
        color: "var(--red)",
      };
    default:
      return base;
  }
}

const styles: Record<string, React.CSSProperties> = {
  arrow: {
    fontSize: "1.4rem",
    fontWeight: 900,
    userSelect: "none",
  },
};
