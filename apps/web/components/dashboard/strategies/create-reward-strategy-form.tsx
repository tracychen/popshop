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
import { useContracts } from "@/providers/contracts-provider";
import { useSelectShop } from "@/providers/select-shop-provider";
import { RewardStrategyType, rewardStrategyTypeInfo } from "@/types/strategies";

const baseSchema = z.object({
  strategyType: z.nativeEnum(RewardStrategyType),
  tokenAddress: z.string().optional().nullable(),
  numTokens: z.number().int().positive().optional().nullable(),
  multiplier: z.number().int().positive().optional().nullable(),
  decayConstant: z.number().int().positive().optional().nullable(),
  baseReward: z.number().int().positive().optional().nullable(),
});

const schema = z.discriminatedUnion("strategyType", [
  baseSchema.extend({
    strategyType: z.literal(RewardStrategyType.FIXED_ERC20_REWARD),
    tokenAddress: z
      .string()
      .refine((value) => isAddress(value), { message: "Invalid address" }),
    numTokens: z.number().int().positive(),
  }),
  baseSchema.extend({
    strategyType: z.literal(RewardStrategyType.LINEAR_ERC20_REWARD),
    tokenAddress: z
      .string()
      .refine((value) => isAddress(value), { message: "Invalid address" }),
    multiplier: z.number().int().positive().lt(Number.MAX_SAFE_INTEGER),
  }),
  baseSchema.extend({
    strategyType: z.literal(RewardStrategyType.BONDING_CURVE_ERC20_REWARD),
    tokenAddress: z
      .string()
      .refine((value) => isAddress(value), { message: "Invalid address" }),
    decayConstant: z.number().int().positive().lt(Number.MAX_SAFE_INTEGER),
    baseReward: z.number().int().positive().lt(Number.MAX_SAFE_INTEGER),
  }),
  baseSchema.extend({
    strategyType: z.literal(RewardStrategyType.ALLOWLIST_FIXED_ERC20_REWARD),
    tokenAddress: z
      .string()
      .refine((value) => isAddress(value), { message: "Invalid address" }),
    numTokens: z.number().int().positive(),
  }),
]);

type CreateRewardStrategyFormData = z.infer<typeof baseSchema>;

export function CreateRewardStrategyForm({
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
  } = useForm<CreateRewardStrategyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const selectedStrategyType = watch("strategyType");

  async function onSubmit(data: CreateRewardStrategyFormData) {
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

  const createStrategy = async (data: CreateRewardStrategyFormData) => {
    toast({
      title: "Processing",
      description: "Sending transaction...",
    });

    // @ts-ignore
    await walletClient.switchChain({ id: chain.id });
    const args = [shop.shopAddress];
    switch (selectedStrategyType) {
      case RewardStrategyType.FIXED_ERC20_REWARD:
        args.push(data.tokenAddress, data.numTokens);
        break;
      case RewardStrategyType.LINEAR_ERC20_REWARD:
        args.push(data.tokenAddress, data.multiplier);
        break;
      case RewardStrategyType.BONDING_CURVE_ERC20_REWARD:
        args.push(data.tokenAddress, data.decayConstant, data.baseReward);
        break;
      case RewardStrategyType.ALLOWLIST_FIXED_ERC20_REWARD:
        args.push(data.tokenAddress, data.numTokens);
        break;
    }

    // @ts-ignore
    const hash = await walletClient.deployContract({
      abi: contracts[selectedStrategyType].abi,
      account: wallets[0].address as `0x${string}`,
      args: args,
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
      await shopContract.write.registerRewardStrategy([contractAddress]);

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
                <DialogTitle>Create New Reward Strategy</DialogTitle>
                <DialogDescription>
                  Create a new onchain reward strategy for <b>{shop?.name}</b>{" "}
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
                            {Object.keys(RewardStrategyType).map(
                              (strategyType) => (
                                <SelectItem
                                  key={strategyType}
                                  value={strategyType}
                                >
                                  {
                                    rewardStrategyTypeInfo[
                                      strategyType as RewardStrategyType
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
                        rewardStrategyTypeInfo[
                          selectedStrategyType as RewardStrategyType
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
                  RewardStrategyType.FIXED_ERC20_REWARD && (
                  <div className="grid gap-6">
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
                          {errors.tokenAddress.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="numTokens">
                        Tokens Rewarded Per Purchase
                      </Label>
                      <Input
                        id="numTokens"
                        placeholder={String(parseEther("100"))}
                        {...register("numTokens", { valueAsNumber: true })}
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
                      {errors.numTokens && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.numTokens.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategyType ===
                  RewardStrategyType.LINEAR_ERC20_REWARD && (
                  <div className="grid gap-6">
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
                          {errors.tokenAddress.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="multiplier">Multiplier</Label>
                      <Input
                        id="multiplier"
                        placeholder="10"
                        {...register("multiplier", { valueAsNumber: true })}
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        The multiplier is used to calculate the reward amount
                        based on the total price paid. For example, for an
                        example token with 18 decimals $EXMP, if the
                        buyer&apos;s total purchase price is 1 ETH and the
                        reward multiplier is 10, and token is also 18 decimals,
                        the buyer will recieve 1 $EXMP.
                      </p>
                      <p className="px-1 text-xs text-muted-foreground">
                        For tokens that do not have 18 decimals, make sure you
                        account for the number of decimals in the multiplier
                        calculation since the reward unit will be scaled on ETH
                        where 1 ETH = 1e18 wei since ETH is the currently
                        accepted currency.
                      </p>
                      {errors.multiplier && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.multiplier.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategyType ===
                  RewardStrategyType.BONDING_CURVE_ERC20_REWARD && (
                  <div className="grid gap-6">
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
                          {errors.tokenAddress.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="decayConstant">Decay Constant</Label>
                      <Input
                        id="decayConstant"
                        placeholder="5"
                        {...register("decayConstant", { valueAsNumber: true })}
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        The decay constant is used to calculate the reward
                        amount based on the total price paid and remaining
                        supply.
                      </p>
                      {errors.decayConstant && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.decayConstant.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="baseReward">Base Reward</Label>
                      <Input
                        id="baseReward"
                        placeholder="1"
                        {...register("baseReward", { valueAsNumber: true })}
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        The base reward is the minimum multiplier for the reward
                        amount.
                      </p>
                      {errors.baseReward && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.baseReward.message}
                        </p>
                      )}
                    </div>{" "}
                    <p className="px-1 text-xs text-muted-foreground">
                      This is a simple function on the purchase amount and
                      supply to approximate a bonding curve effect where the
                      reward increases as the supply decreases and as the total
                      purchase price increases The reward is calculated as
                      `baseReward / (1 + decayConstant * remainingSupply /
                      totalPurchasePrice)`
                    </p>
                  </div>
                )}

                {selectedStrategyType ===
                  RewardStrategyType.ALLOWLIST_FIXED_ERC20_REWARD && (
                  <div className="grid gap-6">
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
                          {errors.tokenAddress.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="numTokens">
                        Tokens Rewarded Per Purchase
                      </Label>
                      <Input
                        id="numTokens"
                        placeholder={String(parseEther("100"))}
                        {...register("numTokens", { valueAsNumber: true })}
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
                      {errors.numTokens && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.numTokens.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
