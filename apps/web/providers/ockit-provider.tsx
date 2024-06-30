"use client";

import { chain } from "@/lib/chain";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

export function OCKitProvider({ children }: { children?: React.ReactNode }) {
  return (
    <WagmiProvider
      config={createConfig({
        chains: [chain],
        transports: {
          [chain.id]: http(),
        },
      })}
    >
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAIN_KIT_API_KEY!}
          chain={chain}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
