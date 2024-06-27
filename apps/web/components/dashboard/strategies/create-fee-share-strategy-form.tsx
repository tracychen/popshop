import { zodResolver } from "@hookform/resolvers/zod";
import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
  FeeShareStrategyType,
  feeShareStrategyTypeInfo,
} from "@/types/strategies";

const BPS_MULTIPLIER = 100;
const MAX_DECIMAL_PLACES = 2;

// Custom validation function to check the number of decimal places
const maxDecimalPlaces = (places: number, value: number) => {
  const decimalPart = value.toString().split(".")[1];
  return !decimalPart || decimalPart.length <= places;
};

const baseSchema = z.object({
  strategyType: z.nativeEnum(FeeShareStrategyType),
  percentage: z
    .number()
    .gte(0)
    .lte(BPS_MULTIPLIER)
    .refine((val) => maxDecimalPlaces(MAX_DECIMAL_PLACES, val), {
      message: `Number must have no more than ${MAX_DECIMAL_PLACES} decimal places`,
    }),
  startTimestamp: z.any().optional().nullable(),
  endTimestamp: z.any().optional().nullable(),
});

const schema = z.discriminatedUnion("strategyType", [
  baseSchema.extend({
    strategyType: z.literal(FeeShareStrategyType.PERCENTAGE_FEE_SHARE),
  }),
  baseSchema.extend({
    strategyType: z.literal(
      FeeShareStrategyType.TIMEFRAME_PERCENTAGE_FEE_SHARE,
    ),
    startTimestamp: z.number().int().gte(0),
    endTimestamp: z.number().int().positive(),
  }),
  baseSchema.extend({
    strategyType: z.literal(
      FeeShareStrategyType.ALLOWLIST_PERCENTAGE_FEE_SHARE,
    ),
  }),
]);

type CreateFeeShareStrategyFormData = z.infer<typeof schema>;

export function CreateFeeShareStrategyForm({
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
  } = useForm<CreateFeeShareStrategyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const selectedStrategyType = watch("strategyType");

  async function onSubmit(data: CreateFeeShareStrategyFormData) {
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

  const createStrategy = async (data: CreateFeeShareStrategyFormData) => {
    toast({
      title: "Processing",
      description: "Sending transaction...",
    });

    // @ts-ignore
    await walletClient.switchChain({ id: chain.id });
    const args = [shop.shopAddress];
    switch (selectedStrategyType) {
      case FeeShareStrategyType.PERCENTAGE_FEE_SHARE:
        args.push(data.percentage! * BPS_MULTIPLIER);
        break;
      case FeeShareStrategyType.TIMEFRAME_PERCENTAGE_FEE_SHARE:
        args.push(
          data.percentage! * BPS_MULTIPLIER,
          data.startTimestamp,
          data.endTimestamp,
        );
        break;
      case FeeShareStrategyType.ALLOWLIST_PERCENTAGE_FEE_SHARE:
        args.push(data.percentage! * BPS_MULTIPLIER);
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
      await shopContract.write.registerFeeShareStrategy([contractAddress]);

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
                <DialogTitle>Create New Fee Share Strategy</DialogTitle>
                <DialogDescription>
                  Create a new onchain fee share strategy for{" "}
                  <b>{shop?.name}</b> using predefined strategy templates.
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
                            {Object.keys(FeeShareStrategyType).map(
                              (strategyType) => (
                                <SelectItem
                                  key={strategyType}
                                  value={strategyType}
                                >
                                  {
                                    feeShareStrategyTypeInfo[
                                      strategyType as FeeShareStrategyType
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
                        feeShareStrategyTypeInfo[
                          selectedStrategyType as FeeShareStrategyType
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
                  FeeShareStrategyType.PERCENTAGE_FEE_SHARE && (
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
                        The referrer / recipient will receive{" "}
                        {watch("percentage") || 0}% of the purchase price.
                      </p>
                      {errors.percentage && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.percentage.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategyType ===
                  FeeShareStrategyType.TIMEFRAME_PERCENTAGE_FEE_SHARE && (
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
                        The referrer / recipient will receive{" "}
                        {watch("percentage") || 0}% of the purchase price.
                      </p>
                      {errors.percentage && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.percentage.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="startTimestamp">
                        Start Timestamp (Unix)
                      </Label>
                      <Input
                        id="startTimestamp"
                        {...register("startTimestamp", { valueAsNumber: true })}
                        type="number"
                        placeholder="0"
                        step="any"
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        The strategy will start on{" "}
                        {new Date(
                          (watch("startTimestamp") || 0) * 1000,
                        ).toLocaleString(undefined, {
                          timeZoneName: "short",
                        })}
                      </p>
                      {errors.startTimestamp && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.startTimestamp.message as string}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="endTimestamp">End Timestamp (Unix)</Label>
                      <Input
                        id="endTimestamp"
                        {...register("endTimestamp", { valueAsNumber: true })}
                        type="number"
                        placeholder="1719646947"
                        step="any"
                      />
                      <p className="px-1 text-xs text-muted-foreground">
                        The strategy will end on{" "}
                        {new Date(watch("endTimestamp")! * 1000).toLocaleString(
                          undefined,
                          {
                            timeZoneName: "short",
                          },
                        )}
                      </p>
                      {errors.endTimestamp && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.endTimestamp.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedStrategyType ===
                  FeeShareStrategyType.ALLOWLIST_PERCENTAGE_FEE_SHARE && (
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
                        The referrer / recipient will receive{" "}
                        {watch("percentage") || 0}% of the purchase price.
                      </p>
                      {errors.percentage && (
                        <p className="px-1 text-xs text-destructive">
                          {errors.percentage.message}
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
