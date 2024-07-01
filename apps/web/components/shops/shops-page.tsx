"use client";

import { getShopMetadata } from "@/lib/metadata";
import { useContracts } from "@/providers/contracts-provider";
import { Shop } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function ShopsPage() {
  const { shopRegistryContract } = useContracts();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>();

  useEffect(() => {
    const fetchShop = async () => {
      if (!shopRegistryContract) return;
      try {
        const shops = await shopRegistryContract.read.getShops([]);
        if (!shops) {
          throw new Error("Shops not found");
        }
        const formattedShops = await Promise.all(
          shops.map(async (shop: any) => {
            const shopMetadata = await getShopMetadata(shop);
            return shopMetadata;
          }),
        );
        setShops(formattedShops);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error",
          description: error.message || "Error fetching shops",
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    fetchShop();
  }, []);

  return (
    <main className="p-6">
      {loading ? (
        <Skeleton className="h-full w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {shops?.map((shop, index) => (
            <Link
              key={shop.shopAddress}
              href={`/shops/${shop.shopAddress}`}
              className="hover:opacity-80"
            >
              <Card className="grid sm:grid-cols-2">
                {index % 2 === 0 && (
                  <CardHeader className="hidden items-center justify-center sm:flex">
                    <CardTitle className="uppercase tracking-wide">
                      {shop.name}
                    </CardTitle>
                    <CardDescription className="hidden sm:flex">
                      {shop.description}
                    </CardDescription>
                  </CardHeader>
                )}
                <CardHeader className="items-center justify-center sm:hidden">
                  <CardTitle className="uppercase tracking-wide">
                    {shop.name}
                  </CardTitle>
                  <CardDescription className="hidden sm:flex">
                    {shop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="sm:pt-6">
                  <div className="grid gap-6">
                    <Image
                      src={
                        shop?.imageUrl
                          ? `https://emerald-skilled-cat-398.mypinata.cloud/ipfs/${shop?.imageUrl}`
                          : "/images/placeholder.svg"
                      }
                      alt="Image"
                      width={320}
                      height={320}
                      className="aspect-square w-full rounded-md object-cover dark:brightness-[0.2] dark:grayscale lg:aspect-auto lg:max-h-72"
                    />
                  </div>
                </CardContent>
                {index % 2 !== 0 && (
                  <CardHeader className="hidden items-center justify-center sm:flex">
                    <CardTitle className="uppercase tracking-wide">
                      {shop.name}
                    </CardTitle>
                    <CardDescription className="hidden sm:flex">
                      {shop.description}
                    </CardDescription>
                  </CardHeader>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
