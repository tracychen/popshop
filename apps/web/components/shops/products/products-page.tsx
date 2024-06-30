"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { contracts } from "@/lib/contracts";
import { getProductMetadata, getShopMetadata } from "@/lib/metadata";
import { useContracts } from "@/providers/contracts-provider";
import { Product, Shop } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEther, getContract } from "viem";

export function ProductsPage({ shopAddress }: { shopAddress: string }) {
  const { publicClient, shopRegistryContract } = useContracts();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop>();
  const [shopContract, setShopContract] = useState<any>();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchShop = async () => {
      if (!shopRegistryContract) return;
      try {
        const shopInfo = await shopRegistryContract.read.getShop([shopAddress]);
        if (!shopInfo) {
          throw new Error("Shop details not found");
        }
        const shopMetadataURI = shopInfo.shopMetadataURI;
        const shopMetadata = await getShopMetadata({
          shopAddress,
          shopMetadataURI,
        });
        setShop(shopMetadata);
        setShopContract(
          // @ts-ignore
          getContract({
            address: shopMetadata?.shopAddress,
            abi: contracts.Shop.abi,
            client: {
              public: publicClient,
            },
          }),
        );
        console.log(shopMetadata);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error",
          description: error.message || "Error fetching shop details",
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    fetchShop();
  }, [shopAddress]);

  const getProducts = async () => {
    setLoading(true);
    try {
      const products = await shopContract.read.getProducts();

      const formattedProducts = await Promise.all(
        products.map(async (product: any) => {
          const metadata = await getProductMetadata(product);
          return {
            id: product.id,
            name: metadata.name,
            description: metadata.description,
            imageUrls: metadata.imageUrls,
            active: !product.paused,
            price: formatEther(product.price),
            totalSold: Number(product.totalSold),
            supply: Number(product.supply),
          };
        }),
      );
      setProducts(formattedProducts);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error fetching products",
        description:
          error.message || "An error occurred while fetching products.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (shopContract) {
      getProducts();
    }
  }, [shopContract]);

  return (
    <main className="grid grid-cols-1 gap-6 p-6">
      <div className="grid place-items-center gap-3 p-6 text-center">
        {loading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="text-2xl font-bold uppercase sm:text-4xl">
            {shop?.name}
          </h1>
        )}
        {loading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <p className="text-balance text-sm">{shop?.description}</p>
        )}
        {loading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <Link
            href={`${chain.blockExplorers?.default.url}/address/${shop?.shopAddress}`}
            className="mx-auto w-full max-w-xs text-sm text-muted-foreground underline"
            target="_blank"
          >
            <p className="overflow-hidden text-ellipsis">{shop?.shopAddress}</p>
          </Link>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-3 lg:w-2/3 xl:grid-cols-4">
          {products
            .filter((product) => product.active)
            .map((product) => (
              <Link
                href={`/shops/${shopAddress}/products/${product.id}`}
                key={product.id}
                className="grid place-items-center gap-3 rounded-md transition-opacity hover:opacity-80"
              >
                <div className="relative inline-flex">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-md object-cover"
                    height="300"
                    src={
                      product.imageUrls.length > 0
                        ? `https://emerald-skilled-cat-398.mypinata.cloud/ipfs/${product.imageUrls[0]}`
                        : "/images/placeholder.svg"
                    }
                    width="300"
                  />
                  {product.supply <= 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute right-2 top-2"
                    >
                      Sold out
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg font-bold md:text-xl">{product.name}</h2>
                <p className="text-sm">{product.price} ETH</p>
              </Link>
            ))}
        </div>
      )}
    </main>
  );
}
