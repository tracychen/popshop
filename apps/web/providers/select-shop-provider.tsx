"use client";
import { ConnectedWallet, useWallets } from "@privy-io/react-auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPublicClient, getContract, http } from "viem";

import { chain } from "@/lib/chain";
import { contracts } from "@/lib/contracts";
import { Shop } from "@/types";

import { useToast } from "../components/ui/use-toast";
import { useContracts } from "./contracts-provider";

const SelectShopContext = createContext(
  {} as {
    getShopMetadata: (shop: {
      shopMetadataURI: string;
      shopAddress: string;
    }) => Promise<Shop>;
    refreshShop: (shopAddress: string) => void;
    shopContract: any;
    shops: Shop[];
    getShops: (wallet: ConnectedWallet) => void;
    shop: any;
    setShop: (data: Shop) => void;
    loading: boolean;
  },
);

export const SelectShopProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop>();
  const [shops, setShops] = useState<Shop[]>([]);
  const { toast } = useToast();
  const { wallets, ready } = useWallets();

  const { walletClient, publicClient } = useContracts();

  const shopRegistryContract = useMemo(
    () =>
      // @ts-ignore
      getContract({
        address: contracts.ShopRegistry.address as `0x${string}`,
        abi: contracts.ShopRegistry.abi,
        client: {
          public: publicClient,
        },
      }),
    [publicClient],
  );

  const shopContract = useMemo(() => {
    if (!shop?.shopAddress) return;
    // @ts-ignore
    return getContract({
      address: shop?.shopAddress as `0x${string}`,
      abi: contracts.Shop.abi,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
  }, [shop]); // eslint-disable-line react-hooks/exhaustive-deps

  const getShopMetadata = useCallback(
    async (shop: { shopMetadataURI: string; shopAddress: string }) => {
      console.log(shop);
      const res = await fetch(
        `https://gateway.pinata.cloud/ipfs/${shop.shopMetadataURI}`,
      );
      const metadata = await res.json();
      return {
        ...metadata,
        shopAddress: shop.shopAddress,
      };
    },
    [],
  );

  const getShops = useCallback(
    async (wallet: ConnectedWallet) => {
      setLoading(true);
      try {
        // @ts-ignore
        const myShops = await shopRegistryContract.read.getShopsByAdmin([
          wallet.address,
        ]);

        const shopMetadata = await Promise.all(
          myShops.map(
            async (shop: { shopMetadataURI: string; shopAddress: string }) => {
              try {
                return getShopMetadata(shop);
              } catch (error) {
                console.error(error);
              }
            },
          ),
        );
        console.log(shopMetadata);
        setShops(shopMetadata.filter((shop: any) => shop !== undefined));
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    },
    [shopRegistryContract, getShopMetadata],
  );

  const refreshShop = async (shopAddress: string) => {
    setLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: chain,
        transport: http(),
      });

      // @ts-ignore
      const shopRegistryContract = getContract({
        address: contracts.ShopRegistry.address as `0x${string}`,
        abi: contracts.ShopRegistry.abi,
        client: {
          public: publicClient,
        },
      });

      const shopInfo = await shopRegistryContract.read.getShop([shopAddress]);
      console.log(shopInfo);

      setShop(await getShopMetadata(shopInfo as any));
    } catch (e) {
      console.error("Error refreshing shop data", e);
      toast({
        title: "Failed to refresh shop data",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ready && wallets && wallets.length > 0) {
      console.log("Getting shops");
      getShops(wallets[0]);
    }
  }, [ready, wallets]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SelectShopContext.Provider
      value={{
        getShopMetadata,
        refreshShop,
        shopContract,
        shops,
        getShops,
        shop,
        setShop,
        loading,
      }}
    >
      {children}
    </SelectShopContext.Provider>
  );
};

export const useSelectShop = () => useContext(SelectShopContext);
