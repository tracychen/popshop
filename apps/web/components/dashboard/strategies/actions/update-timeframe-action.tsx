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
  startTimestamp: z.number().int().gte(0),
  endTimestamp: z.number().int().positive(),
});

type UpdateTimeframeFormData = z.infer<typeof schema>;

function UpdateTimeframeAction({
  initialStartTimestamp,
  initialEndTimestamp,
  strategyContract,
  refresh,
}: {
  initialStartTimestamp: BigInt;
  initialEndTimestamp: BigInt;
  strategyContract: any;
  refresh: () => Promise<void>;
}) {
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateTimeframeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      startTimestamp: Number(initialStartTimestamp),
      endTimestamp: Number(initialEndTimestamp),
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();

  async function updateStartTimestamp(startTimestamp: number) {
    toast({
      title: "Processing",
      description: "Sending transaction to update start timestamp...",
    });
    const hash = await strategyContract.write.setStartTimestamp([
      startTimestamp,
    ]);
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

  async function updateEndTimestamp(endTimestamp: number) {
    toast({
      title: "Processing",
      description: "Sending transaction to update end timestamp...",
    });
    const hash = await strategyContract.write.setEndTimestamp([endTimestamp]);
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

  async function onSubmit(data: UpdateTimeframeFormData) {
    setIsSaving(true);
    try {
      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });
      let hasUpdate = false;
      if (data.startTimestamp != Number(initialStartTimestamp)) {
        await updateStartTimestamp(data.startTimestamp);
        hasUpdate = true;
      }
      if (data.endTimestamp != Number(initialEndTimestamp)) {
        await updateEndTimestamp(data.endTimestamp);
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
        <Label htmlFor="startTimestamp">Start Timestamp (Unix)</Label>
        <Input
          id="startTimestamp"
          {...register("startTimestamp", { valueAsNumber: true })}
          type="number"
          placeholder="0"
          step="any"
        />
        <p className="px-1 text-xs text-muted-foreground">
          The strategy will start on{" "}
          {new Date((watch("startTimestamp") || 0) * 1000).toLocaleString(
            undefined,
            {
              timeZoneName: "short",
            },
          )}
        </p>
        {errors.startTimestamp && (
          <p className="px-1 text-xs text-destructive">
            {errors.startTimestamp.message}
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
          {new Date(watch("endTimestamp")! * 1000).toLocaleString(undefined, {
            timeZoneName: "short",
          })}
        </p>
        {errors.endTimestamp && (
          <p className="px-1 text-xs text-destructive">
            {errors.endTimestamp.message}
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

export const getUpdateTimeframeAction = ({
  initialStartTimestamp,
  initialEndTimestamp,
  strategyContract,
  refresh,
}: {
  initialStartTimestamp: BigInt;
  initialEndTimestamp: BigInt;
  strategyContract: any;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "update-timeframe",
    tabTitle: "Update Strategy Start / End Time",
    tabShortTitle: "Timeframe",
    tabDescription:
      "Update the start and end time of the strategy. This will trigger separate transactions for each update.",
    tabContent: (
      <UpdateTimeframeAction
        initialStartTimestamp={initialStartTimestamp}
        initialEndTimestamp={initialEndTimestamp}
        strategyContract={strategyContract}
        refresh={refresh}
      />
    ),
  };
};
