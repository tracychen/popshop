"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  formatEther,
  getContract,
  isAddress,
  parseEther,
  zeroAddress,
} from "viem";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { contracts } from "@/lib/contracts";
import { cn } from "@/lib/utils";
import { useContracts } from "@/providers/contracts-provider";
import { Product } from "@/types";
import SwapEth from "./swap-eth";

const buyProductSchema = z.object({
  count: z.number().int().positive(),
});

type BuyProductFormData = z.infer<typeof buyProductSchema>;

export function BuyProductForm({
  product,
  referrer,
  shopAddress,
  refresh,
}: {
  product?: Product;
  referrer?: string;
  shopAddress: string;
  refresh: () => Promise<void>;
}) {
  const { ready, user } = usePrivy();
  const [isSaving, setIsSaving] = useState(false);
  const { walletClient, publicClient } = useContracts();
  const [discount, setDiscount] = useState<{
    percentage: number;
    amount: number;
  }>({
    percentage: 0,
    amount: 0,
  });

  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BuyProductFormData>({
    resolver: zodResolver(buyProductSchema),
    defaultValues: {
      count: 0,
    },
  });

  const multiply = (a: number, b: number) => {
    // parse a to wei and multiply by b
    return formatEther(parseEther(String(a)) * BigInt(b));
  };
  const count = watch("count");

  const totalPriceBeforeDiscount = useMemo(() => {
    return multiply(product?.price || 0, count || 0);
  }, [product, count]);

  const totalPriceAfterDiscount = useMemo(() => {
    const totalPriceBeforeDiscount = multiply(product?.price || 0, count || 0);
    // subtract with no decimal errors
    return formatEther(
      parseEther(String(totalPriceBeforeDiscount)) -
        parseEther(String(discount.amount)),
    );
  }, [product, count, discount]);

  const getDiscount = async (product: Product) => {
    // @ts-ignore
    const strategyContract = getContract({
      address: product.discountStrategy as `0x${string}`,
      abi: contracts.IDiscountStrategy.abi,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    });
    // @ts-ignore
    const discountAmount = await strategyContract.read.calculateDiscount([
      parseEther(String(totalPriceBeforeDiscount)),
      walletClient!.account!.address,
    ]);
    const amountInEther = Number(formatEther(discountAmount));
    const percentage =
      (amountInEther / Number(totalPriceBeforeDiscount)) * 100 || 0;

    setDiscount({
      percentage: Number(percentage.toFixed(2)),
      amount: amountInEther,
    });
  };

  useEffect(() => {
    if (product) {
      getDiscount(product);
    }
  }, [product, count]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready || !user) {
    return (
      <Card x-chunk="dashboard-07-chunk-5">
        <CardHeader>
          <CardTitle>Purchase</CardTitle>
          <CardDescription>
            Please login to purchase this product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div></div>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(data: BuyProductFormData) {
    setIsSaving(true);
    try {
      // check supply
      if (product!.supply < data.count) {
        throw new Error(
          `Cannot complete your purchase, remaining supply: ${product!.supply}`,
        );
      }

      toast({
        title: "Processing",
        description: "Sending transaction...",
      });
      // @ts-ignore
      const shopContract = getContract({
        address: shopAddress as `0x${string}`,
        abi: contracts.Shop.abi,
        client: {
          public: publicClient,
          wallet: walletClient,
        },
      });
      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });
      const referrerAddress =
        referrer && isAddress(referrer) ? referrer : zeroAddress;
      // @ts-ignore
      const hash = await shopContract.write.purchaseProduct({
        args: [product!.id, data.count, referrerAddress],
        value: parseEther(totalPriceAfterDiscount),
      });
      toast({
        title: "Processing",
        description: `Waiting for transaction receipt, hash: ${hash}`,
      });
      // @ts-ignore
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      if (receipt.status !== "success") {
        throw new Error("Transaction failed, hash: " + hash);
      }

      toast({
        title: "Success",
        description: `Purchased ${product?.name} successfully`,
      });

      reset();
      await refresh();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error purchasing product. Please contact us or try again later.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card x-chunk="dashboard-07-chunk-3">
        <CardHeader>
          <CardTitle>Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label>Price</Label>
              <div className="text-sm">{product?.price} ETH</div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="count">Quantity</Label>
              <Input
                id="count"
                {...register("count", { valueAsNumber: true })}
                type="number"
                placeholder="1"
              />

              {errors.count && (
                <p className="px-1 text-xs text-destructive">
                  {errors.count.message}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label>Price (before discount)</Label>
              <div className="text-sm">
                {product?.price} ETH x {count || 0} = {totalPriceBeforeDiscount}{" "}
                ETH
              </div>
            </div>
            <div className="grid gap-3">
              <Label>Discounts</Label>
              <div
                className={cn(
                  "text-sm",
                  discount.amount > 0
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {discount.percentage}% (-{discount.amount} ETH)
              </div>
            </div>
            <div className="grid gap-3">
              <Label>Total Price</Label>
              <div
                className={cn("text-sm", discount.amount > 0 && "text-primary")}
              >
                {totalPriceAfterDiscount} ETH
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="grid w-full gap-3">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-x-2"
            >
              {isSaving && (
                <Loader className="h-4 w-4 text-primary-foreground" />
              )}
              Submit
            </Button>
            <SwapEth>
              <Button variant="secondary">Swap ETH</Button>
            </SwapEth>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
