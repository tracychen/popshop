"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadSimple } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getContract, isAddress, parseEther, zeroAddress } from "viem";
import { z } from "zod";

import { storeProductMetadata } from "@/app/actions/shopMetadata";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { contracts } from "@/lib/contracts";
import { truncateStringMiddle } from "@/lib/utils";
import { useContracts } from "@/providers/contracts-provider";
import { useSelectShop } from "@/providers/select-shop-provider";
import {
  DiscountStrategyType,
  discountStrategyTypeInfo,
  FeeShareStrategyType,
  feeShareStrategyTypeInfo,
  RewardStrategyType,
  rewardStrategyTypeInfo,
} from "@/types/strategies";

const addProductSchema = z.object({
  imageFiles: z
    .any()
    .superRefine((files, ctx) => {
      if (!files) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please upload a file.",
          fatal: true,
        });

        return z.NEVER;
      }
      const fileList = Array.from(files as FileList) as File[];
      if (fileList.length <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please upload at least one file.",
          fatal: true,
        });

        return z.NEVER;
      }
      const file = fileList[0];
      if (file.size > 5000000 || file.size <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File size must be less than 5MB.",
          fatal: true,
        });

        return z.NEVER;
      }
      if (!file.type.startsWith("image/")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid file type. Please upload an image.",
          fatal: true,
        });

        return z.NEVER;
      }
    })
    .transform((files) => {
      return files as FileList;
    }),
  name: z.string().min(3).max(100),
  description: z.string().optional().nullable(),
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
  paused: z.string().refine((value) => value === "true" || value === "false", {
    message: "Invalid status",
  }),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

export function AddProductForm() {
  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      rewardStrategyAddress: zeroAddress,
      discountStrategyAddress: zeroAddress,
      feeShareStrategyAddress: zeroAddress,
      paused: "false",
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
        // @ts-ignore
        const contract = getContract({
          address: strategyAddress,
          abi: contracts.IFeeShareStrategy.abi,
          client: {
            public: publicClient,
          },
        });
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
        // @ts-ignore
        const contract = getContract({
          address: strategyAddress,
          abi: contracts.IDiscountStrategy.abi,
          client: {
            public: publicClient,
          },
        });
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

  async function onSubmit(data: AddProductFormData) {
    setIsSaving(true);
    try {
      toast({
        title: "Processing",
        description: "Uploading metadata...",
      });
      // iterate over files
      const hashes = await uploadFiles(data.imageFiles);
      console.log({ hashes });

      const hash = await storeProductMetadata(
        data.name,
        data.description || "",
        hashes,
      );
      console.log({ hash });

      await addProduct(hash, data);

      toast({
        title: "Success",
        description: "Added product successfully",
      });

      // reset form
      reset();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          "Error adding product. Please contact us or try again later.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  }

  const addProduct = async (
    productMetadataURI: string,
    data: AddProductFormData,
  ) => {
    if (loading || !shopContract || !walletClient) {
      throw new Error("Wallet or contract not ready");
    }
    toast({
      title: "Processing",
      description: "Sending transaction...",
    });

    // @ts-ignore
    await walletClient.switchChain({ id: chain.id });

    const hash = await shopContract.write.addProduct([
      productMetadataURI,
      data.supply,
      parseEther(String(data.price)),
      data.discountStrategyAddress,
      data.feeShareStrategyAddress,
      data.rewardStrategyAddress,
      data.paused ? data.paused === "true" : false,
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
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          <Card x-chunk="dashboard-07-chunk-0">
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
              <CardDescription>
                Add a new product for <b>{shop?.name}</b>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    type="text"
                    className="w-full"
                    placeholder="Onchain Summer Flowers"
                  />
                  {errors.name && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                  />
                  {errors.description && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
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
            <Button variant="outline" size="sm" onClick={() => reset()}>
              Reset
            </Button>
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
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          <Card x-chunk="dashboard-07-chunk-3">
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    name="paused"
                    control={control}
                    rules={{ required: true }}
                    render={({
                      field: { ref, onChange, ...otherFieldProps },
                    }) => {
                      return (
                        <Select onValueChange={onChange} {...otherFieldProps}>
                          <SelectTrigger id="status" aria-label="Select status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">Active</SelectItem>
                            <SelectItem value="true">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {errors.paused && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.paused.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Select multiple files when uploading to upload multiple images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 gap-2">
                  {watch("imageFiles") &&
                    Array.from(watch("imageFiles")).map((file, index) => (
                      <Image
                        key={index}
                        alt="Product image"
                        className="aspect-square w-full rounded-md object-cover"
                        height="84"
                        src={URL.createObjectURL(file)}
                        width="84"
                      />
                    ))}
                  <label className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
                    <UploadSimple
                      className="h-4 w-4 text-muted-foreground"
                      weight="fill"
                    />
                    <span className="sr-only">Upload</span>
                    <Input
                      id="image"
                      multiple
                      accept="image/*"
                      {...register("imageFiles")}
                      type="file"
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.imageFiles && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.imageFiles.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm" onClick={() => reset()}>
          Reset
        </Button>
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
