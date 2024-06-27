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
  decayConstant: z
    .string()
    .nonempty()
    .refine((v) => parseInt(v) > 0, {
      message: "Please enter a positive number",
    }),
  baseReward: z
    .string()
    .nonempty()
    .refine((v) => parseInt(v) > 0, {
      message: "Please enter a positive number",
    }),
});

type UpdateBondingCurveFormData = z.infer<typeof schema>;

function UpdateBondingCurveAction({
  strategyContract,
  initialDecayConstant,
  initialBaseReward,
  refresh,
}: {
  strategyContract: any;
  initialDecayConstant: BigInt;
  initialBaseReward: BigInt;
  refresh: () => Promise<void>;
}) {
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateBondingCurveFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      decayConstant: `${initialDecayConstant}`,
      baseReward: `${initialBaseReward}`,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();

  async function updateDecayConstant(decayConstant: string) {
    toast({
      title: "Processing",
      description: "Sending transaction to update decay constant...",
    });
    const hash = await strategyContract.write.setDecayConstant([decayConstant]);
    toast({
      title: "Processing",
      description: `Waiting for transaction receipt, hash: ${hash}`,
    });
    // @ts-ignore
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error("Transaction failed, hash: " + hash);
    }
  }

  async function updateBaseReward(baseReward: string) {
    toast({
      title: "Processing",
      description: "Sending transaction to update base reward...",
    });
    const hash = await strategyContract.write.setBaseReward([baseReward]);
    toast({
      title: "Processing",
      description: `Waiting for transaction receipt, hash: ${hash}`,
    });
    // @ts-ignore
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error("Transaction failed, hash: " + hash);
    }
  }

  async function onSubmit(data: UpdateBondingCurveFormData) {
    setIsSaving(true);
    try {
      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });
      let hasUpdate = false;
      if (BigInt(data.decayConstant) != initialDecayConstant) {
        await updateDecayConstant(data.decayConstant);
        hasUpdate = true;
      }
      if (BigInt(data.baseReward) != initialBaseReward) {
        await updateBaseReward(data.baseReward);
        hasUpdate = true;
      }
      if (!hasUpdate) {
        toast({
          title: "Success",
          description: "No changes to update",
        });
      } else {
        toast({
          title: "Success",
          description: "Updated successfully",
        });
      }
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
        <Label htmlFor="decayConstant">Decay Constant</Label>
        <Input
          id="decayConstant"
          {...register("decayConstant")}
          type="number"
          className="w-full"
          placeholder="10"
        />

        {errors.decayConstant && (
          <p className="px-1 text-xs text-destructive">
            {errors.decayConstant.message}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="baseReward">
          Base Reward Multiplier on Total Purchase Price
        </Label>
        <Input
          id="baseReward"
          {...register("baseReward")}
          type="number"
          className="w-full"
          placeholder="10"
        />
        {errors.baseReward && (
          <p className="px-1 text-xs text-destructive">
            {errors.baseReward.message}
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

export const getUpdateBondingCurveAction = ({
  strategyContract,
  initialDecayConstant,
  initialBaseReward,
  refresh,
}: {
  strategyContract: any;
  initialDecayConstant: BigInt;
  initialBaseReward: BigInt;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "update-bonding-curve",
    tabTitle: "Update Bonding Curve Variables",
    tabShortTitle: "Update",
    tabDescription:
      "Update the bonding curve variables for the strategy.  This is a simple function on the purchase amount and supply to approximate a bonding curve effect where the reward increases as the supply decreases and as the total purchase price increases The reward is calculated as baseReward / (1+ decayConstant * remainingSupply / totalPurchasePrice).",
    tabContent: (
      <UpdateBondingCurveAction
        strategyContract={strategyContract}
        initialDecayConstant={initialDecayConstant}
        initialBaseReward={initialBaseReward}
        refresh={refresh}
      />
    ),
  };
};
