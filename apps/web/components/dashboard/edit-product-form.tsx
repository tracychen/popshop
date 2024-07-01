"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getContract, isAddress, parseEther, zeroAddress } from "viem";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { contracts } from "@/lib/contracts";
import { truncateStringMiddle } from "@/lib/utils";
import { useContracts } from "@/providers/contracts-provider";
import { useSelectShop } from "@/providers/select-shop-provider";
import { Product } from "@/types";
import {
  DiscountStrategyType,
  discountStrategyTypeInfo,
  FeeShareStrategyType,
  feeShareStrategyTypeInfo,
  RewardStrategyType,
  rewardStrategyTypeInfo,
} from "@/types/strategies";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

const addProductSchema = z.object({
  supply: z.number().int().gt(0).lt(Number.MAX_SAFE_INTEGER),
  price: z.number().gt(0).lt(Number.MAX_SAFE_INTEGER),
  rewardStrategyAddress: z
    .string()
    .refine((value) => isAddress(value), { message: "Invalid address" }),
  discountStrategyAddress: z
    .string()
    .refine((value) => isAddress(value), { message: "Invalid address" }),
  feeShareStrategyAddress: z
    .string()
    .refine((value) => isAddress(value), { message: "Invalid address" }),
});

type EditProductFormData = z.infer<typeof addProductSchema>;

export function EditProductForm({ product }: { product: Product }) {
  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      supply: product.supply,
      price: Number(product.price),
      rewardStrategyAddress: product.rewardStrategy as `0x${string}`,
      discountStrategyAddress: product.discountStrategy as `0x${string}`,
      feeShareStrategyAddress: product.feeShareStrategy as `0x${string}`,
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const { loading, publicClient, walletClient } = useContracts();
  const { shopContract, shop } = useSelectShop();
  const [rewardStrategies, setRewardStrategies] = useState<
    {
      address: string;
      type: string;
    }[]
  >([]);
  const [feeShareStrategies, setFeeShareStrategies] = useState<
    {
      address: string;
      type: string;
    }[]
  >([]);
  const [discountStrategies, setDiscountStrategies] = useState<
    {
      address: string;
      type: string;
    }[]
  >([]);

  useEffect(() => {
    const getFeeShareStrategies = async () => {
      const feeShareStrategies =
        await shopContract.read.getFeeShareStrategies();
      const transformedStrategies = [];
      for (const strategyAddress of feeShareStrategies) {
        const contract = getContract({
          address: strategyAddress,
          abi: contracts.IFeeShareStrategy.abi,
          client: {
            public: publicClient,
          },
        });
        // @ts-ignore
        const type = await contract.read.getType();
        transformedStrategies.push({
          address: strategyAddress,
          type,
        });
      }
      setFeeShareStrategies(transformedStrategies);
    };
    if (shopContract) {
      getFeeShareStrategies();
    }
  }, [shopContract]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const getDiscountStrategies = async () => {
      const discountStrategies =
        await shopContract.read.getDiscountStrategies();
      const transformedStrategies = [];
      for (const strategyAddress of discountStrategies) {
        const contract = getContract({
          address: strategyAddress,
          abi: contracts.IDiscountStrategy.abi,
          client: {
            public: publicClient,
          },
        });
        // @ts-ignore
        const type = await contract.read.getType();
        transformedStrategies.push({
          address: strategyAddress,
          type,
        });
      }
      setDiscountStrategies(transformedStrategies);
    };
    if (shopContract) {
      getDiscountStrategies();
    }
  }, [shopContract]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const getRewardStrategies = async () => {
      const rewardStrategies = await shopContract.read.getRewardStrategies();
      const transformedStrategies = [];
      for (const strategyAddress of rewardStrategies) {
        // @ts-ignore
        const contract = getContract({
          address: strategyAddress,
          abi: contracts.IRewardStrategy.abi,
          client: {
            public: publicClient,
          },
        });
        // @ts-ignore
        const type = await contract.read.getType();
        transformedStrategies.push({
          address: strategyAddress,
          type,
        });
      }
      setRewardStrategies(transformedStrategies);
    };
    if (shopContract) {
      getRewardStrategies();
    }
  }, [shopContract]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFiles = async (fileList: FileList) => {
    const files = Array.from(fileList) as File[];

    const hashes = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
            },
            body: formData,
          },
        );
        const resData = await res.json();
        return resData.IpfsHash as string;
      }),
    );
    return hashes;
  };

  async function onSubmit(data: EditProductFormData) {
    setIsSaving(true);
    try {
      if (loading || !shopContract || !walletClient) {
        throw new Error("Wallet or contract not ready");
      }
      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      await addProduct(data);

      toast({
        title: "Success",
        description: "Updated product successfully",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error adding product. Please contact us or try again later.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  }

  const addProduct = async (data: EditProductFormData) => {
    // @ts-ignore
    await walletClient.switchChain({ id: chain.id });
    const prevProduct = await shopContract.read.products([product.id]);

    const hash = await shopContract.write.updateProduct([
      product.id,
      prevProduct[1], // metadataURI
      data.supply,
      parseEther(String(data.price)),
      data.discountStrategyAddress,
      data.feeShareStrategyAddress,
      data.rewardStrategyAddress,
    ]);

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
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8"
    >
      <div className="flex items-center gap-x-2 text-sm font-semibold text-muted-foreground">
        <Button variant="outline" size="icon" className="h-7 w-7">
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        Back
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-3 lg:gap-8">
          <Card x-chunk="dashboard-07-chunk-0">
            <CardHeader>
              <CardTitle>Edit Product</CardTitle>
              <CardDescription>
                You can edit the details of the product here. Product name,
                description, and image updates are currently not supported
                through the UI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <div className="text-sm text-muted-foreground">
                    {product.name}
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                  <div className="text-sm text-muted-foreground">
                    {product.description}
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-3">
                    <Label htmlFor="supply">Supply</Label>
                    <Input
                      id="supply"
                      {...register("supply", { valueAsNumber: true })}
                      type="number"
                      className="w-full"
                      placeholder="10"
                    />
                    {errors.supply && (
                      <p className="px-1 text-xs text-destructive">
                        {errors.supply.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="price">Price (ETH)</Label>
                    <Input
                      id="price"
                      {...register("price", { valueAsNumber: true })}
                      type="number"
                      className="w-full"
                      placeholder="100"
                      step="any"
                    />
                    {errors.price && (
                      <p className="px-1 text-xs text-destructive">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-07-chunk-2">
            <CardHeader>
              {/* allow users to select existing strategies or create new ones */}
              <CardTitle>Product Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-3">
                  <Label htmlFor="reward">Reward</Label>
                  <Controller
                    name="rewardStrategyAddress"
                    control={control}
                    rules={{ required: true }}
                    render={({
                      field: { ref, onChange, ...otherFieldProps },
                    }) => {
                      return (
                        <Select onValueChange={onChange} {...otherFieldProps}>
                          <SelectTrigger
                            id="reward"
                            aria-label="Select strategy"
                          >
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={zeroAddress}>None</SelectItem>
                            {rewardStrategies.map((strategy) => (
                              <SelectItem
                                key={strategy.address}
                                value={strategy.address}
                              >
                                {`${
                                  rewardStrategyTypeInfo[
                                    strategy.type as RewardStrategyType
                                  ].name
                                } - ${truncateStringMiddle(
                                  strategy.address,
                                  13,
                                )}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {errors.rewardStrategyAddress && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.rewardStrategyAddress.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="discount">Discount</Label>
                  <Controller
                    name="discountStrategyAddress"
                    control={control}
                    rules={{ required: true }}
                    render={({
                      field: { ref, onChange, ...otherFieldProps },
                    }) => {
                      return (
                        <Select onValueChange={onChange} {...otherFieldProps}>
                          <SelectTrigger
                            id="discount"
                            aria-label="Select strategy"
                          >
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={zeroAddress}>None</SelectItem>
                            {discountStrategies.map((strategy) => (
                              <SelectItem
                                key={strategy.address}
                                value={strategy.address}
                              >
                                {`${
                                  discountStrategyTypeInfo[
                                    strategy.type as DiscountStrategyType
                                  ].name
                                } - ${truncateStringMiddle(
                                  strategy.address,
                                  13,
                                )}`}
                              </SelectItem>
                            ))}{" "}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {errors.discountStrategyAddress && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.discountStrategyAddress.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="referral">Referral</Label>
                  <Controller
                    name="feeShareStrategyAddress"
                    control={control}
                    rules={{ required: true }}
                    render={({
                      field: { ref, onChange, ...otherFieldProps },
                    }) => {
                      return (
                        <Select onValueChange={onChange} {...otherFieldProps}>
                          <SelectTrigger
                            id="referral"
                            aria-label="Select strategy"
                          >
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={zeroAddress}>None</SelectItem>
                            {feeShareStrategies.map((strategy) => (
                              <SelectItem
                                key={strategy.address}
                                value={strategy.address}
                              >
                                {`${
                                  feeShareStrategyTypeInfo[
                                    strategy.type as FeeShareStrategyType
                                  ].name
                                } - ${truncateStringMiddle(
                                  strategy.address,
                                  13,
                                )}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {errors.feeShareStrategyAddress && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.feeShareStrategyAddress.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button
              size="sm"
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-x-2"
            >
              {isSaving && (
                <Loader className="h-4 w-4 text-primary-foreground" />
              )}
              Save Product
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button
          size="sm"
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-x-2"
        >
          {isSaving && <Loader className="h-4 w-4 text-primary-foreground" />}
          Save Product
        </Button>
      </div>
    </form>
  );
}
