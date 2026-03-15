import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { recordTrade } from "../services/api";
import { GRID_COLUMNS } from "@tap-to-trade/shared";

const CELL_LIFETIME_MS = 60_000; // cells expire after 60 seconds

export function useGameLoop() {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function tick() {
      const state = useGameStore.getState();
      const { currentPrice, openPositions, gridCells } = state;

      if (currentPrice === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = Date.now();

      openPositions.forEach((position, cellId) => {
        const cell = gridCells.get(cellId);
        if (!cell) return;

        // Check take-profit: price crosses the TP level
        const tpLevel = cell.priceLevel;
        const isLong = position.direction === "long";
        const tpHit = isLong
          ? currentPrice >= tpLevel
          : currentPrice <= tpLevel;

        // Check expiry: position opened too long ago
        const expired = now - position.openedAt > CELL_LIFETIME_MS;

        if (tpHit || expired) {
          const closePrice = currentPrice;
          const pnl = isLong
            ? (closePrice - position.entryPrice) * position.size
            : (position.entryPrice - closePrice) * position.size;

          // Approximate screen position for PnL float
          const x = Math.random() * 200 + 100;
          const y = Math.random() * 200 + 100;

          state.closePosition(cellId, closePrice, pnl, x, y);

          // Record the trade asynchronously
          recordTrade({
            cellId,
            direction: position.direction,
            size: position.size,
            entryPrice: position.entryPrice,
            closePrice,
            pnl,
            openedAt: new Date(position.openedAt).toISOString(),
            closedAt: new Date().toISOString(),
            closeReason: tpHit ? "tp_hit" : "expired",
          }).catch((err) => console.error("[game] failed to record trade:", err));
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
}
