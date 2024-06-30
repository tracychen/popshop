import { Gift, HandCoins, SealPercent } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { getContract, zeroAddress } from "viem";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { contracts } from "@/lib/contracts";
import { useContracts } from "@/providers/contracts-provider";
import { Product } from "@/types";
import {
  DiscountStrategyType,
  discountStrategyTypeInfo,
  FeeShareStrategyType,
  feeShareStrategyTypeInfo,
  RewardStrategyType,
  rewardStrategyTypeInfo,
} from "@/types/strategies";

export function ProductStrategiesCard({
  shopMetadata,
  product,
}: {
  shopMetadata?: any;
  product?: Product;
}) {
  const { publicClient } = useContracts();
  const [loading, setLoading] = useState(true);
  const [discountStrategy, setDiscountStrategy] = useState<{
    address: string;
    type: DiscountStrategyType;
  }>();
  const [rewardStrategy, setRewardStrategy] = useState<{
    address: string;
    type: RewardStrategyType;
  }>();
  const [feeShareStrategy, setFeeShareStrategy] = useState<{
    address: string;
    type: FeeShareStrategyType;
  }>();

  const getDiscountStrategy = async () => {
    if (!product || product.discountStrategy == zeroAddress) {
      return;
    }
    if (product?.discountStrategy) {
      // @ts-ignore
      const strategy = getContract({
        address: product.discountStrategy as `0x${string}`,
        abi: contracts.IDiscountStrategy.abi,
        client: {
          public: publicClient,
        },
      });
      // @ts-ignore
      const type = await strategy.read.getType();
      setDiscountStrategy({
        address: product.discountStrategy,
        type: type as DiscountStrategyType,
      });
    }
  };

  const getRewardStrategy = async () => {
    if (!product || product.rewardStrategy == zeroAddress) {
      return;
    }
    if (product?.rewardStrategy) {
      // @ts-ignore
      const strategy = getContract({
        address: product.rewardStrategy as `0x${string}`,
        abi: contracts.IRewardStrategy.abi,
        client: {
          public: publicClient,
        },
      });
      // @ts-ignore
      const type = await strategy.read.getType();
      setRewardStrategy({
        address: product.rewardStrategy,
        type: type as RewardStrategyType,
      });
    }
  };

  const getFeeShareStrategy = async () => {
    if (!product || product.feeShareStrategy == zeroAddress) {
      return;
    }
    if (product?.feeShareStrategy) {
      // @ts-ignore
      const strategy = getContract({
        address: product.feeShareStrategy as `0x${string}`,
        abi: contracts.IFeeShareStrategy.abi,
        client: {
          public: publicClient,
        },
      });
      // @ts-ignore
      const type = await strategy.read.getType();
      setFeeShareStrategy({
        address: product.feeShareStrategy,
        type: type as FeeShareStrategyType,
      });
    }
  };

  useEffect(() => {
    const getStrategies = async () => {
      setLoading(true);
      try {
        await Promise.all([
          getDiscountStrategy(),
          getRewardStrategy(),
          getFeeShareStrategy(),
        ]);
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error",
          description: error.message || "Error fetching strategies",
          variant: "destructive",
        });
      }
      setLoading(false);
    };
    if (product) {
      getStrategies();
    }
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card x-chunk="dashboard-07-chunk-1">
      <CardHeader>
        <CardTitle>Discounts & Rewards</CardTitle>
        {/* <CardDescription>
          {shopMetadata?.name || "We"} luvs u!! Here are some ways you can
          save/earn more by purchasing or referring others to this product.
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="text-sm">
            <b>{shopMetadata?.name || "We"}</b> luvs u!! Here are some ways you
            can save/earn more by purchasing or referring others to this
            product.
          </div>
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="grid gap-3">
              <Label>
                <SealPercent className="mr-1 inline h-4 w-4" /> Discount
                Strategy
              </Label>
              <div className="text-sm text-muted-foreground">
                {discountStrategy
                  ? discountStrategyTypeInfo[discountStrategy.type].description
                  : "None"}{" "}
                Any discounts that are eligible for you will be calculated and
                displayed in the purchase section.
              </div>
            </div>
          )}
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="grid gap-3">
              <Label>
                <Gift className="mr-1 inline h-4 w-4" /> Reward Strategy
              </Label>
              <div className="text-sm text-muted-foreground">
                {rewardStrategy
                  ? rewardStrategyTypeInfo[rewardStrategy.type].description
                  : "None"}{" "}
                These are automatically issued at the time of purchase.
              </div>
            </div>
          )}
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="grid gap-3">
              <Label>
                <HandCoins className="mr-1 inline h-4 w-4" /> Fee Share Strategy
              </Label>
              <div className="text-sm text-muted-foreground">
                {feeShareStrategy
                  ? feeShareStrategyTypeInfo[feeShareStrategy.type].description
                  : "None"}
              </div>
            </div>
          )}
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="grid gap-3">
              <p className="text-xs italic">
                For more information on how these strategies work, please
                contact us or the shop owner!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
