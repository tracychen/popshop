"use client";

import { chain } from "@/lib/chain";
import { getShopMetadata } from "@/lib/metadata";
import { useContracts } from "@/providers/contracts-provider";
import { Shop } from "@/types";
import { ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { truncateStringMiddle } from "@/lib/utils";

export function ShopPage({ shopAddress }: { shopAddress: string }) {
  const { publicClient, shopRegistryContract } = useContracts();
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop>();

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
  return (
    <div className="h-screen w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-3 px-4 text-center">
            {loading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <h1 className="text-3xl font-bold uppercase sm:text-6xl">
                {shop?.name}
              </h1>
            )}
            {loading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <p className="text-balance text-muted-foreground">
                {shop?.description}
              </p>
            )}
            {loading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <Link
                href={`${chain.blockExplorers?.default.url}/address/${shop?.shopAddress}`}
                className="mx-auto w-48 max-w-xs items-center text-sm text-muted-foreground underline sm:w-full"
                target="_blank"
              >
                <p className="hidden sm:flex">{shop?.shopAddress}</p>
                <p className="sm:hidden">
                  {truncateStringMiddle(shop?.shopAddress || "")}
                </p>
              </Link>
            )}
          </div>
          <div className="grid gap-6">
            <Link href={`/shops/${shopAddress}/products`}>
              <Button className="w-full">
                Enter <ArrowRight className="inline" />
              </Button>{" "}
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Create your own popshop*{" "}
            <Link href="/dashboard" className="underline">
              here
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <Image
            src={
              shop?.imageUrl
                ? `https://emerald-skilled-cat-398.mypinata.cloud/ipfs/${shop?.imageUrl}`
                : "/images/placeholder.svg"
            }
            alt="Image"
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
