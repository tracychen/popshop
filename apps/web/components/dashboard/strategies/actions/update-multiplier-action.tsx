import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { useContracts } from "@/providers/contracts-provider";

import { ActionDialogTab } from "./action-dialog";

const schema = z.object({
  multiplier: z.number().int().positive().min(1),
});

type UpdateMultiplierFormData = z.infer<typeof schema>;

function UpdateMultiplierAction({
  symbol,
  decimals,
  strategyContract,
  refresh,
}: {
  symbol: string;
  decimals: number;
  strategyContract: any;
  refresh: () => Promise<void>;
}) {
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateMultiplierFormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();

  async function onSubmit(data: UpdateMultiplierFormData) {
    setIsSaving(true);
    try {
      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await strategyContract.write.setMultiplier([
        data.multiplier,
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

      toast({
        title: "Success",
        description: "Updated successfully",
      });
      reset();
      await refresh();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error updating. Please contact us or try again later.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8"
    >
      <div className="grid gap-3">
        <Label htmlFor="multiplier">Multiplier on Total Purchase Price</Label>
        <Input
          id="multiplier"
          {...register("multiplier", { valueAsNumber: true })}
          type="number"
          className="w-full"
          placeholder="10"
        />
        {watch("multiplier") > 0 && (
          <p className="px-1 text-xs text-muted-foreground">
            {`This will reward 
              ${watch(
                "multiplier",
              )} x (purchase price) ${symbol} per purchase.`}
          </p>
        )}
        {errors.multiplier && (
          <p className="px-1 text-xs text-destructive">
            {errors.multiplier.message}
          </p>
        )}
      </div>
      <Button
        size="sm"
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-x-2"
      >
        {isSaving && <Loader className="h-4 w-4 text-primary-foreground" />}
        Update
      </Button>
    </form>
  );
}

export const getUpdateMultiplierAction = ({
  symbol,
  decimals,
  strategyContract,
  refresh,
}: {
  symbol: string;
  decimals: number;
  strategyContract: any;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "update-multiplier",
    tabTitle: "Update Reward Multiplier",
    tabShortTitle: "Update",
    tabDescription:
      "Update the reward multiplier for each purchase. This will reward buyers with more tokens based on their total purchase price",
    tabContent: (
      <UpdateMultiplierAction
        symbol={symbol}
        decimals={decimals}
        strategyContract={strategyContract}
        refresh={refresh}
      />
    ),
  };
};
