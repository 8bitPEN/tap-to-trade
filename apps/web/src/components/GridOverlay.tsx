import { useEffect, useState, useCallback, type RefObject } from "react";
import type { IChartApi } from "lightweight-charts";
import { GRID_LEVELS, GRID_COLUMNS } from "@tap-to-trade/shared";
import { useGameStore } from "../store/gameStore";
import { GridCell } from "./GridCell";

interface GridOverlayProps {
  chartRef: RefObject<IChartApi | null>;
  containerRef: RefObject<HTMLDivElement | null>;
}

interface CellLayout {
  id: string;
  row: number;
  col: number;
  priceLevel: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function GridOverlay({ chartRef, containerRef }: GridOverlayProps) {
  const [cells, setCells] = useState<CellLayout[]>([]);
  const currentPrice = useGameStore((s) => s.currentPrice);

  const recalculate = useCallback(() => {
    const chart = chartRef.current;
    const container = containerRef.current;
    if (!chart || !container || currentPrice === 0) return;

    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    // Calculate price range visible on chart
    const priceSpread = currentPrice * 0.005; // 0.5% spread around current price
    const priceStep = (priceSpread * 2) / GRID_LEVELS;

    const cellWidth = width / GRID_COLUMNS;
    const cellHeight = height / GRID_LEVELS;

    const newCells: CellLayout[] = [];

    for (let row = 0; row < GRID_LEVELS; row++) {
      const priceLevel = currentPrice + priceSpread - row * priceStep;

      for (let col = 0; col < GRID_COLUMNS; col++) {
        newCells.push({
          id: `${row}-${col}`,
          row,
          col,
          priceLevel: Math.round(priceLevel * 100) / 100,
          x: col * cellWidth,
          y: row * cellHeight,
          width: cellWidth,
          height: cellHeight,
        });
      }
    }

    setCells(newCells);
  }, [chartRef, containerRef, currentPrice]);

  // Recalculate on price changes (throttled)
  useEffect(() => {
    const timer = setTimeout(recalculate, 100);
    return () => clearTimeout(timer);
  }, [recalculate]);

  // Recalculate on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => recalculate());
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, recalculate]);

  return (
    <div style={styles.overlay}>
      {cells.map((cell) => (
        <GridCell
          key={cell.id}
          cellId={cell.id}
          priceLevel={cell.priceLevel}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={cell.height}
          row={cell.row}
        />
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 10,
  },
};
