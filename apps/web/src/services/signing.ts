// Placeholder until bulk-keychain-wasm is available
// Real implementation will use: import { init, prepareGroup, prepareFaucet } from 'bulk-keychain-wasm';

import { SYMBOL, DEFAULT_SIZE } from "@tap-to-trade/shared";
import type { Direction } from "@tap-to-trade/shared";
import { submitOrder, requestFaucet } from "./api";

let wasmInitialized = false;

export async function initWasm() {
  try {
    // await init(); // uncomment when bulk-keychain-wasm is available
    wasmInitialized = true;
  } catch (e) {
    console.warn("WASM init failed, using mock signing:", e);
  }
}

export function isWasmReady() {
  return wasmInitialized;
}

export function buildOrders(direction: Direction, priceLevel: number) {
  const isBuy = direction === "long";
  return [
    { m: { c: SYMBOL, b: isBuy, sz: DEFAULT_SIZE, r: false } },
    { l: { c: SYMBOL, b: !isBuy, px: priceLevel, sz: DEFAULT_SIZE, tif: "GTC", r: true } },
  ];
}

export async function signAndPlaceOrder(
  wallet: unknown,
  signMessage: (params: { message: Uint8Array }) => Promise<{ signature: Uint8Array }>,
  direction: Direction,
  priceLevel: number,
  account: string,
) {
  const orders = buildOrders(direction, priceLevel);

  // When WASM is available:
  // const prepared = prepareGroup(orders, { account });
  // const { signature } = await signMessage({ message: prepared.messageBytes });
  // const signedTx = prepared.finalizeBytes(new Uint8Array(signature));
  // return submitOrder(signedTx);

  // Mock for now -- just submit the orders directly
  console.log("Would sign orders:", orders, "for account:", account);
  return submitOrder({ orders, account });
}

export async function signAndRequestFaucet(
  wallet: unknown,
  signMessage: (params: { message: Uint8Array }) => Promise<{ signature: Uint8Array }>,
  account: string,
) {
  // When WASM is available:
  // const prepared = prepareFaucet({ account });
  // const { signature } = await signMessage({ message: prepared.messageBytes });
  // const signedTx = prepared.finalizeBytes(new Uint8Array(signature));
  // return requestFaucet(signedTx);

  console.log("Would request faucet for:", account);
  return requestFaucet({ account });
}
