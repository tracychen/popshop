"use client";

import {
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  GetSiweMessageOptions,
  RainbowKitSiweNextAuthProvider,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { http, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to popshop",
});

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID;

const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: projectId,
  chains: [base as any],
  transports: {
    [base.id]: http(),
  },
});

export interface WalletProviderProps {
  children: ReactNode;
  session?: Session | null;
}

const queryClient = new QueryClient();

const WalletProvider = (props: WalletProviderProps) => {
  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider refetchInterval={0} session={props.session}>
            <RainbowKitSiweNextAuthProvider
              getSiweMessageOptions={getSiweMessageOptions}
            >
              <RainbowKitProvider
                modalSize="compact"
                theme={lightTheme({
                  borderRadius: "medium",
                  fontStack: "system",
                })}
              >
                {props.children}
              </RainbowKitProvider>
            </RainbowKitSiweNextAuthProvider>
          </SessionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
};

export default WalletProvider;
