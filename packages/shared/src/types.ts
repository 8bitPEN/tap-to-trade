export type CellStatus = "empty" | "open-long" | "open-short" | "closing-win" | "closing-loss";
export type Direction = "long" | "short";
export type CloseReason = "tp_hit" | "expired" | "manual";

export interface GridCell {
  id: string;
  priceLevel: number;
  timeColumn: number;
  direction: Direction | null;
  size: number;
  entryPrice: number | null;
  orderId: string | null;
  status: CellStatus;
}

export interface Position {
  cellId: string;
  direction: Direction;
  size: number;
  entryPrice: number;
  openOrderId: string;
  tpOrderId: string | null;
  openedAt: number;
}

export interface Trade {
  id: string;
  userId: string;
  walletAddress: string;
  direction: Direction;
  size: number;
  entryPrice: number;
  closePrice: number;
  pnl: number;
  openedAt: string;
  closedAt: string;
  closeReason: CloseReason;
}

export interface User {
  id: string;
  privyId: string;
  walletAddress: string;
  twitterHandle: string | null;
  twitterAvatar: string | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  twitterHandle: string | null;
  twitterAvatar: string | null;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

// WebSocket message types
export interface PriceTick {
  type: "ticker";
  symbol: string;
  price: number;
  timestamp: number;
}

export interface OrderUpdate {
  type: "order_update";
  orderId: string;
  status: string;
  filledPrice?: number;
}

export interface TradeClose {
  type: "trade_close";
  cellId: string;
  pnl: number;
  closeReason: CloseReason;
}

export type WSMessage = PriceTick | OrderUpdate | TradeClose;
