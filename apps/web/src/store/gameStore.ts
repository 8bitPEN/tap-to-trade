import { create } from "zustand";
import type { GridCell, Position, Direction } from "@tap-to-trade/shared";
import { DEFAULT_SIZE } from "@tap-to-trade/shared";

interface RecentClose {
  cellId: string;
  pnl: number;
  timestamp: number;
  x: number;
  y: number;
}

interface GameState {
  currentPrice: number;
  priceHistory: { time: number; value: number }[];
  gridCells: Map<string, GridCell>;
  openPositions: Map<string, Position>;
  recentCloses: RecentClose[];
  walletAddress: string | null;
  isConnected: boolean;

  onPriceTick: (price: number, timestamp: number) => void;
  tapCell: (cellId: string, priceLevel: number, direction: Direction, entryPrice: number) => void;
  addPosition: (position: Position) => void;
  closePosition: (cellId: string, closePrice: number, pnl: number, x: number, y: number) => void;
  setWalletAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  clearRecentClose: (cellId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentPrice: 0,
  priceHistory: [],
  gridCells: new Map(),
  openPositions: new Map(),
  recentCloses: [],
  walletAddress: null,
  isConnected: false,

  onPriceTick: (price, timestamp) => {
    set((state) => ({
      currentPrice: price,
      priceHistory: [...state.priceHistory.slice(-500), { time: timestamp, value: price }],
    }));
  },

  tapCell: (cellId, priceLevel, direction, entryPrice) => {
    set((state) => {
      const newCells = new Map(state.gridCells);
      newCells.set(cellId, {
        id: cellId,
        priceLevel,
        timeColumn: 0,
        direction,
        size: DEFAULT_SIZE,
        entryPrice,
        orderId: null,
        status: direction === "long" ? "open-long" : "open-short",
      });
      return { gridCells: newCells };
    });
  },

  addPosition: (position) => {
    set((state) => {
      const newPositions = new Map(state.openPositions);
      newPositions.set(position.cellId, position);
      return { openPositions: newPositions };
    });
  },

  closePosition: (cellId, closePrice, pnl, x, y) => {
    set((state) => {
      const newPositions = new Map(state.openPositions);
      newPositions.delete(cellId);
      const newCells = new Map(state.gridCells);
      const cell = newCells.get(cellId);
      if (cell) {
        newCells.set(cellId, {
          ...cell,
          status: pnl > 0 ? "closing-win" : "closing-loss",
        });
      }
      return {
        openPositions: newPositions,
        gridCells: newCells,
        recentCloses: [...state.recentCloses, { cellId, pnl, timestamp: Date.now(), x, y }],
      };
    });
  },

  setWalletAddress: (address) => set({ walletAddress: address }),
  setConnected: (connected) => set({ isConnected: connected }),
  clearRecentClose: (cellId) => {
    set((state) => ({
      recentCloses: state.recentCloses.filter((c) => c.cellId !== cellId),
    }));
  },
}));
