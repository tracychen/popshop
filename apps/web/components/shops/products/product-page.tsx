"use client";
import { XLogo } from "@phosphor-icons/react";
import { useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatEther, getContract } from "viem";

import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { contracts } from "@/lib/contracts";
import { useContracts } from "@/providers/contracts-provider";
import { Product } from "@/types";

import { getProductMetadata, getShopMetadata } from "@/lib/metadata";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { BecomeReferrerCard } from "./become-referrer-card";
import { BuyProductForm } from "./buy-product-form";
import { ProductStrategiesCard } from "./product-strategies-card";

export function ProductPage({
  shopAddress,
  productId,
}: {
  shopAddress: string;
  productId: number;
}) {
  const searchParams = useSearchParams();

  const referrer = searchParams.get("ref");
  const { wallets } = useWallets();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(true);
  const { publicClient, shopRegistryContract } = useContracts();
  const [shopContract, setShopContract] = useState<any>();
  const [shopMetadata, setShopMetadata] = useState();

  useEffect(() => {
    const getShopContract = async () => {
      if (!shopRegistryContract) return;

      const shopInfo = await shopRegistryContract.read.getShop([shopAddress]);
      if (!shopInfo) {
        throw new Error("Shop details not found");
      }
      const shopMetadataURI = shopInfo.shopMetadataURI;
      const shopMetadata = await getShopMetadata({
        shopAddress,
        shopMetadataURI,
      });
      setShopMetadata(shopMetadata);
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
    };
    getShopContract();
  }, [shopRegistryContract]); // eslint-disable-line react-hooks/exhaustive-deps

  const getProduct = async () => {
    setLoading(true);
    try {
      const [
        id,
        metadataURI,
        supply,
        price,
        discountStrategy,
        feeShareStrategy,
        rewardStrategy,
        paused,
        totalSold,
      ] = await shopContract.read.products([productId]);

      const metadata = await getProductMetadata({ metadataURI });

      const formattedProduct = {
        id: id,
        name: metadata.name,
        description: metadata.description,
        imageUrls: metadata.imageUrls,
        active: !paused,
        price: Number(formatEther(price)),
        totalSold: Number(totalSold),
        supply: Number(supply),
        discountStrategy,
        feeShareStrategy,
        rewardStrategy,
      };
      setProduct(formattedProduct);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error fetching product",
        description:
          error.message || "An error occurred while fetching product.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (shopContract) {
      getProduct();
    }
  }, [shopContract, productId, getProductMetadata]); // eslint-disable-line react-hooks/exhaustive-deps

  const shareText = `Check out this cool product on popshop*!`;
  const shareURL = useMemo(() => {
    if (wallets && wallets[0]) {
      return `${window.location.origin}/shops/${shopAddress}/products/${productId}?ref=${wallets[0].address}`;
    }
    return `${window.location.origin}/shops/${shopAddress}/products/${productId}`;
  }, [shopAddress, productId, wallets]);

  return (
    <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <Link href={`/shops/${shopAddress}/products`}>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        {loading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {product?.name}
          </h1>
        )}
        {!loading &&
          (product?.supply ? (
            <Badge variant="outline" className="ml-auto bg-background sm:ml-0">
              In stock
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-auto sm:ml-0">
              Sold out
            </Badge>
          ))}
        {!loading && !product?.active && (
          <Badge variant="destructive" className="ml-auto sm:ml-0">
            Inactive
          </Badge>
        )}
        <div className="hidden items-center gap-3 md:ml-auto md:flex">
          <p className="text-xs text-muted-foreground">Share on</p>
          <Link
            href={`http://twitter.com/share?text=${encodeURIComponent(
              shareText,
            )}&url=${encodeURIComponent(shareURL)}`}
            target="_blank"
          >
            <XLogo className="h-5 w-5" />
          </Link>
          <Link
            href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
              shareText,
            )}&embeds%5B%5D=${encodeURIComponent(shareURL)}`}
            target="_blank"
          >
            <Icons.farcaster className="h-5 w-5" />
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <div className="grid place-items-center px-12">
            <Carousel className="z-0 w-full max-w-xs">
              <CarouselContent>
                {loading ? (
                  <CarouselItem>
                    <Skeleton className="h-80 w-80" />
                  </CarouselItem>
                ) : (
                  product?.imageUrls.map((imageUrl, index) => (
                    <CarouselItem key={index}>
                      <Image
                        alt="Product image"
                        className="aspect-square w-full rounded-md object-cover"
                        height="320"
                        src={`https://emerald-skilled-cat-398.mypinata.cloud/ipfs/${imageUrl}`}
                        width="320"
                      />
                    </CarouselItem>
                  ))
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <Card x-chunk="dashboard-07-chunk-0">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                product?.description
              )}
              {loading ? (
                <Skeleton className="h-6 w-1/2" />
              ) : (
                <p>
                  <span className="font-semibold">Price:</span> {product?.price}{" "}
                  ETH
                </p>
              )}
              {loading ? (
                <Skeleton className="h-6 w-1/2" />
              ) : (
                <p>
                  <span className="font-semibold">Supply:</span>{" "}
                  {product?.supply}
                </p>
              )}
            </CardContent>
          </Card>
          <ProductStrategiesCard
            shopMetadata={shopMetadata}
            product={product}
          />
        </div>
        {product?.active && (
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <BuyProductForm
              product={product}
              referrer={referrer || undefined}
              shopAddress={shopContract?.address}
              refresh={getProduct}
            />

            <BecomeReferrerCard
              shopAddress={shopAddress}
              productId={productId}
            />
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-3 md:hidden">
        <p className="text-xs text-muted-foreground">Share on</p>
        <Link
          href={`http://twitter.com/share?text=${encodeURIComponent(
            shareText,
          )}&url=${encodeURIComponent(shareURL)}`}
          target="_blank"
        >
          <XLogo className="h-5 w-5" />
        </Link>
        <Link
          href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
            shareText,
          )}&embeds%5B%5D=${encodeURIComponent(shareURL)}`}
          target="_blank"
        >
          <Icons.farcaster className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
