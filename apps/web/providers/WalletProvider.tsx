"use client";

import {
  connectorsForWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  coreWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import { type ReactNode } from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to starter",
});

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [avalanche, avalancheFuji],
  [publicProvider()],
);

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID;

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      coreWallet({ projectId, chains }),
      metaMaskWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export interface WalletProviderProps {
  children: ReactNode;
  session?: Session | null;
}

const WalletProvider = (props: WalletProviderProps) => {
  return (
    <>
      <WagmiConfig config={config}>
        <SessionProvider refetchInterval={0} session={props.session}>
          <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider
              chains={chains}
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
      </WagmiConfig>
    </>
  );
};

export default WalletProvider;
