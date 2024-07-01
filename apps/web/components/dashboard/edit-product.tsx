"use client";
import { useEffect, useState } from "react";
import { formatEther } from "viem";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelectShop } from "@/providers/select-shop-provider";
import { Product } from "@/types";

import { getProductMetadata } from "@/lib/metadata";
import { toast } from "../ui/use-toast";
import { EditProductForm } from "./edit-product-form";

export function EditProductDashboard({ productId }: { productId: number }) {
  const { shop, shopContract } = useSelectShop();
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState(false);

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
      const product = {
        id: Number(id),
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
      setProduct(product);
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
    if (shop) {
      getProduct();
    }
  }, [shop, shopContract]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shop) {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <CardDescription>
              You must select a shop to be able to edit a product.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      {!loading && product && <EditProductForm product={product} />}
    </main>
  );
}
