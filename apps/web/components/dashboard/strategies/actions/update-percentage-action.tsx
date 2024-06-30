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

const BPS_MULTIPLIER = 100;
const MAX_DECIMAL_PLACES = 2;

// Custom validation function to check the number of decimal places
const maxDecimalPlaces = (places: number) => (value: number) => {
  const decimalPart = value.toString().split(".")[1];
  return !decimalPart || decimalPart.length <= places;
};

const schema = z.object({
  percentage: z
    .number()
    .gte(0)
    .lte(BPS_MULTIPLIER)
    .refine(maxDecimalPlaces(MAX_DECIMAL_PLACES), {
      message: `Number must have no more than ${MAX_DECIMAL_PLACES} decimal places`,
    }),
});

type UpdatePercentageFormData = z.infer<typeof schema>;

function UpdatePercentageAction({
  initialBps,
  strategyContract,
  refresh,
}: {
  initialBps: number;
  strategyContract: any;
  refresh: () => Promise<void>;
}) {
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdatePercentageFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      percentage: Number(initialBps) / BPS_MULTIPLIER,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();

  async function onSubmit(data: UpdatePercentageFormData) {
    setIsSaving(true);
    try {
      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await strategyContract.write.setBps([
        data.percentage * BPS_MULTIPLIER,
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
        <Label htmlFor="percentage">Percentage of Purchase Price</Label>
        <Input
          id="percentage"
          {...register("percentage", { valueAsNumber: true })}
          type="number"
          placeholder="1.25"
          step="any"
        />
        <p className="px-1 text-xs text-muted-foreground">
          Applies for {watch("percentage") || 0}% of the purchase price.
        </p>
        {errors.percentage && (
          <p className="px-1 text-xs text-destructive">
            {errors.percentage.message}
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

export const getUpdatePercentageAction = ({
  initialBps,
  strategyContract,
  refresh,
}: {
  initialBps: number;
  strategyContract: any;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "update-percentage",
    tabTitle: "Update Percentage",
    tabShortTitle: "Percentage",
    tabDescription:
      "Update the percentage of the purchase price that will be applied for the strategy.",
    tabContent: (
      <UpdatePercentageAction
        initialBps={initialBps}
        strategyContract={strategyContract}
        refresh={refresh}
      />
    ),
  };
};
