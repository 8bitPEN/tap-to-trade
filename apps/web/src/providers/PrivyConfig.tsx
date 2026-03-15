import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const solanaConnectors = toSolanaWalletConnectors();

export function PrivyConfig({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || "placeholder-app-id"}
      config={{
        loginMethods: ["twitter"],
        appearance: {
          theme: "dark",
          walletChainType: "solana-only",
        },
        embeddedWallets: {
          solana: { createOnLogin: "all-users" },
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
