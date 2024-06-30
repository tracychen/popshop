"use client";

import { chain } from "@/lib/chain";
import { PrivyProvider } from "@privy-io/react-auth";
import { anvil, base, baseSepolia } from "viem/chains";

export function AuthProvider({ children }: { children?: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="clxo3etkc00obqo7nwp6o33ra"
      config={{
        defaultChain: chain,
        supportedChains: [base, baseSepolia, anvil],
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: "smartWalletOnly",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
