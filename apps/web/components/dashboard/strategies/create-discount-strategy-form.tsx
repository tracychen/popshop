import { zodResolver } from "@hookform/resolvers/zod";
import { useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { isAddress, parseEther } from "viem";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  DiscountStrategyType,
  discountStrategyTypeInfo,
} from "@/types/strategies";

const BPS_MULTIPLIER = 100;
const MAX_DECIMAL_PLACES = 2;

// Custom validation function to check the number of decimal places
const maxDecimalPlaces = (places: number, value: number) => {
  const decimalPart = value.toString().split(".")[1];
  return !decimalPart || decimalPart.length <= places;
};

const baseSchema = z.object({
  strategyType: z.nativeEnum(DiscountStrategyType),
  percentage: z.any().optional().nullable(),
  minBalance: z.any().optional().nullable(),
  tokenAddress: z.any().optional().nullable(),
  startTimestamp: z.number().optional().nullable(),
  endTimestamp: z.any().optional().nullable(),
  indexerAddress: z.any().optional().nullable(),
  schemaUid: z.any().optional().nullable(),
});

const schema = z.discriminatedUnion("strategyType", [
  baseSchema.extend({
    strategyType: z.literal(DiscountStrategyType.MIN_ERC20_DISCOUNT),
    percentage: z
      .number()
      .gte(0)
      .lte(BPS_MULTIPLIER)
      .refine((val) => maxDecimalPlaces(MAX_DECIMAL_PLACES, val), {
        message: `Number must have no more than ${MAX_DECIMAL_PLACES} decimal places`,
      }),
    tokenAddress: z
      .string()
      .refine((value) => isAddress(value), { message: "Invalid address" }),
    minBalance: z.number().int().positive(),
  }),
  baseSchema.extend({
    strategyType: z.literal(DiscountStrategyType.MIN_ERC721_DISCOUNT),
    percentage: z
      .number()
      .gte(0)
      .lte(BPS_MULTIPLIER)
      .refine((val) => maxDecimalPlaces(MAX_DECIMAL_PLACES, val), {
        message: `Number must have no more than ${MAX_DECIMAL_PLACES} decimal places`,
      }),
    tokenAddress: z
      .string()
      .refine((value) => isAddress(value), { message: "Invalid address" }),
    minBalance: z.number().int().positive(),
  }),
  baseSchema.extend({
    strategyType: z.literal(DiscountStrategyType.ALLOWLIST_DISCOUNT),
  }),
  baseSchema.extend({
    strategyType: z.literal(DiscountStrategyType.EAS_ATTESTATION_DISCOUNT),
    percentage: z
      .number()
      .gte(0)
      .lte(BPS_MULTIPLIER)
      .refine((val) => maxDecimalPlaces(MAX_DECIMAL_PLACES, val), {
        message: `Number must have no more than ${MAX_DECIMAL_PLACES} decimal places`,
      }),
    indexerAddress: z
      .string()
      .refine((value) => isAddress(value), { message: "Invalid address" }),
    schemaUid: z.string().refine((value) => value.length === 66, {
      message: "Invalid schema UID",
    }),
  }),
]);

type CreateDiscountStrategyFormData = z.infer<typeof schema>;

export function CreateDiscountStrategyForm({
  children,
  refresh,
}: {
  children: React.ReactNode;
  refresh: () => Promise<void>;
}) {
  const { wallets } = useWallets();
  const { shop, shopContract } = useSelectShop();
  const { walletClient, publicClient } = useContracts();
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateDiscountStrategyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const selectedStrategyType = watch("strategyType");

  async function onSubmit(data: CreateDiscountStrategyFormData) {
    setIsSaving(true);
    try {
      await createStrategy(data);

      // reset form
      reset();
      await refresh();
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error creating strategy. Please contact us or try again later.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  }

  const createStrategy = async (data: CreateDiscountStrategyFormData) => {
    toast({
      title: "Processing",
      description: "Sending transaction...",
    });

    // @ts-ignore
    await walletClient.switchChain({ id: chain.id });
    const args = [shop.shopAddress];
    switch (selectedStrategyType) {
      case DiscountStrategyType.MIN_ERC20_DISCOUNT:
        args.push(
          data.tokenAddress,
          data.percentage! * BPS_MULTIPLIER,
          data.minBalance,
        );
        break;
      case DiscountStrategyType.MIN_ERC721_DISCOUNT:
        args.push(
          data.tokenAddress,
          data.percentage! * BPS_MULTIPLIER,
          data.minBalance,
        );
        break;
      case DiscountStrategyType.ALLOWLIST_DISCOUNT:
        // dont need to pass any extra arguments
        break;
      case DiscountStrategyType.EAS_ATTESTATION_DISCOUNT:
        args.push(
          data.percentage! * BPS_MULTIPLIER,
          data.schemaUid,
          data.indexerAddress,
        );
        break;
    }

    // @ts-ignore
    const hash = await walletClient.deployContract({
      abi: contracts[selectedStrategyType].abi,
      account: wallets[0].address as `0x${string}`,
      args: args,
      // @ts-ignore
      bytecode: contracts[selectedStrategyType].bytecode,
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
    // contract address
    const contractAddress = receipt.contractAddress;
    if (!contractAddress) {
      throw new Error(
        "Contract address not found, unable to register your shop.",
      );
    }

    toast({
      title: "Processing",
      description: `Registering strategy to your shop...`,
    });

    // @ts-ignore
    const registerStrategyHash =
      await shopContract.write.registerDiscountStrategy([contractAddress]);

    toast({
      title: "Processing",
      description: `Waiting for transaction receipt, hash: ${registerStrategyHash}`,
    });
    // @ts-ignore
    const registerStrategyReceipt =
      await publicClient.waitForTransactionReceipt({
        hash: registerStrategyHash,
      });
    if (registerStrategyReceipt.status !== "success") {
      throw new Error("Transaction failed, hash: " + registerStrategyHash);
    }

    toast({
      title: "Success",
      description: "Created strategy successfully",
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={async (isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            reset();
          }
        }}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent x-chunk="dashboard-07-chunk-0">
          <ScrollArea className="max-h-[calc(100vh-4rem)]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid auto-rows-max items-start gap-4 p-2 lg:col-span-2 lg:gap-8"
            >
              <DialogHeader>
                <DialogTitle>Create New Discount Strategy</DialogTitle>
                <DialogDescription>
                  Create a new onchain discount strategy for <b>{shop?.name}</b>{" "}
                  using predefined strategy templates.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="strategyType">Strategy Type</Label>
                  <Controller
                    name="strategyType"
                    control={control}
                    rules={{ required: true }}
                    render={({
                      field: { ref, onChange, ...otherFieldProps },
                    }) => {
                      return (
                        <Select onValueChange={onChange} {...otherFieldProps}>
                          <SelectTrigger
                            id="strategyType"
                            aria-label="Select strategy"
                          >
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(DiscountStrategyType).map(
                              (strategyType) => (
                                <SelectItem
                                  key={strategyType}
                                  value={strategyType}
                                >
                                  {
                                    discountStrategyTypeInfo[
                                      strategyType as DiscountStrategyType
                                    ].name
                                  }
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {selectedStrategyType && (
                    <p className="px-1 text-xs text-muted-foreground">
                      {
                        discountStrategyTypeInfo[
                          selectedStrategyType as DiscountStrategyType
                        ].description
                      }
                    </p>
                  )}
                  {errors.strategyType && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.strategyType.message}
                    </p>
                  )}
                </div>

                {selectedStrategyType ===
                  DiscountStrategyType.MIN_ERC20_DISCOUNT && (
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="percentage">
                        Percentage of Purchase Price
                      </Label>
                      <Input
                        id="percentage"
                        {...register("percentage", { valueAsNumber: true })}
                        type="number"
                        placeholder="1.25"
                        step="any"
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        The buyer will receive a {watch("percentage") || 0}%
                        discount on their total purchase price.
                      </p>
                      {errors.percentage && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.percentage.message as string}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="tokenAddress">ERC20 Token Address</Label>
                      <Input
                        id="tokenAddress"
                        placeholder="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
                        {...register("tokenAddress")}
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        Make sure this is the ERC20 token address on{" "}
                        {chain.name}.
                      </p>
                      {errors.tokenAddress && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.tokenAddress.message as string}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="minBalance">
                        Minimum Token Balance Required
                      </Label>
                      <Input
                        id="minBalance"
                        placeholder={String(parseEther("100"))}
                        {...register("minBalance", { valueAsNumber: true })}
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        Token units are based on the number of decimals of the
                        token, e.g. 1 USDC = 1e6 or 1000000 units. You can use
                        the{" "}
                        <Link
                          href="https://basescan.org/unitconverter"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          BaseScan
                        </Link>{" "}
                        unit converter to convert token amounts.
                      </p>
                      {errors.minBalance && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.minBalance.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategyType ===
                  DiscountStrategyType.MIN_ERC721_DISCOUNT && (
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="percentage">
                        Percentage of Purchase Price
                      </Label>
                      <Input
                        id="percentage"
                        {...register("percentage", { valueAsNumber: true })}
                        type="number"
                        placeholder="1.25"
                        step="any"
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        The buyer will receive a {watch("percentage") || 0}%
                        discount on their total purchase price.
                      </p>
                      {errors.percentage && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.percentage.message as string}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="tokenAddress">ERC721 Token Address</Label>
                      <Input
                        id="tokenAddress"
                        placeholder="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
                        {...register("tokenAddress")}
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        Make sure this is the ERC721 token address on{" "}
                        {chain.name}.
                      </p>
                      {errors.tokenAddress && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.tokenAddress.message as string}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="minBalance">
                        Minimum Token Balance Required
                      </Label>
                      <Input
                        id="minBalance"
                        placeholder={String(parseEther("100"))}
                        {...register("minBalance", { valueAsNumber: true })}
                      />
                      {errors.minBalance && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.minBalance.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategyType ===
                  DiscountStrategyType.EAS_ATTESTATION_DISCOUNT && (
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="percentage">
                        Percentage of Purchase Price
                      </Label>
                      <Input
                        id="percentage"
                        {...register("percentage", { valueAsNumber: true })}
                        type="number"
                        placeholder="1.25"
                        step="any"
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        The buyer will receive a {watch("percentage") || 0}%
                        discount on their total purchase price.
                      </p>
                      {errors.percentage && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.percentage.message as string}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="indexerAddress">Indexer Address</Label>
                      <Input
                        id="indexerAddress"
                        placeholder="0x2c7eE1E5f416dfF40054c27A62f7B357C4E8619C"
                        {...register("indexerAddress")}
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        Make sure this is the indexer address on {chain.name}.
                        For example, the Coinbase Indexer is{" "}
                        <Link
                          href="https://basescan.org/address/0x2c7eE1E5f416dfF40054c27A62f7B357C4E8619C"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {truncateStringMiddle(
                            "0x2c7ee1e5f416dff40054c27a62f7b357c4e8619c",
                          )}
                        </Link>{" "}
                        on Base.
                      </p>
                      {errors.indexerAddress && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.indexerAddress.message as string}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="schemaUid">EAS Schema</Label>
                      <Input
                        id="schemaUid"
                        placeholder="0x2f34a2ffe5f87b2f45fbc7c784896b768d77261e2f24f77341ae43751c765a69"
                        {...register("schemaUid")}
                      />
                      {errors.schemaUid && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.schemaUid.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-1 text-xs text-muted-foreground">
                You will be prompted so send two transactions:
                <ul className="list-inside list-decimal">
                  <li>Create the strategy contract</li>
                  <li>Register the strategy to your shop</li>
                </ul>
              </div>
              <DialogFooter className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
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
                  Create
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
