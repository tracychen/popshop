"use client";
import { useWallets } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
} from "viem";

import { chain } from "@/lib/chain";
import { contracts } from "@/lib/contracts";

const ContractsContext = createContext(
  {} as {
    publicClient: any;
    walletClient: any;
    shopRegistryContract: any;
    loading: boolean;
  },
);

export const ContractsProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(true);

  const { wallets } = useWallets();
  const [walletClient, setWalletClient] = useState<any>();

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: chain,
        transport: http(),
      }),
    [],
  );

  useEffect(() => {
    const getWalletClient = async () => {
      if (wallets && wallets.length > 0) {
        setLoading(true);
        const wc = createWalletClient({
          chain: chain,
          transport: custom(await wallets[0].getEthereumProvider()),
          account: wallets[0].address as `0x${string}`,
        });
        setWalletClient(wc);
        setLoading(false);
      }
    };
    getWalletClient();
  }, [wallets]);

  const shopRegistryContract = useMemo(() => {
    // @ts-ignore
    return getContract({
      address: contracts.ShopRegistry.address,
      abi: contracts.ShopRegistry.abi,
      client: {
        public: publicClient,
      },
    });
  }, [publicClient]);

  return (
    <ContractsContext.Provider
      value={{
        publicClient,
        walletClient,
        shopRegistryContract,
        loading,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
};

export const useContracts = () => useContext(ContractsContext);
