import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { parseEther } from "viem";
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
  minBalance: z
    .string()
    .nonempty()
    .refine((v) => parseInt(v) > 0, {
      message: "Please enter a positive number",
    }),
});

type UpdateMinBalanceFormData = z.infer<typeof schema>;

function UpdateMinBalanceAction({
  strategyContract,
  refresh,
}: {
  strategyContract: any;
  refresh: () => Promise<void>;
}) {
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateMinBalanceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();

  async function onSubmit(data: UpdateMinBalanceFormData) {
    setIsSaving(true);
    try {
      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await strategyContract.write.setMinBalance([
        data.minBalance,
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
        <Label htmlFor="minBalance">Min. Token Balance For Discount</Label>
        <Input
          id="minBalance"
          {...register("minBalance")}
          type="text"
          className="w-full"
          placeholder={parseEther("10").toString()}
        />
        {Number(watch("minBalance")) > 0 && (
          <p className="px-1 text-xs text-muted-foreground">
            {`Buyers will need ${watch(
              "minBalance",
            )} NFTs to get this discount.`}
          </p>
        )}
        {errors.minBalance && (
          <p className="px-1 text-xs text-destructive">
            {errors.minBalance.message}
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

export const getUpdateMinBalanceAction = ({
  strategyContract,
  refresh,
}: {
  strategyContract: any;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "update-min-balance",
    tabTitle: "Update Minimum Token Balance",
    tabShortTitle: "Min. Balance",
    tabDescription:
      "Update the number of NFTs that buyers will need to get a discount.",
    tabContent: (
      <UpdateMinBalanceAction
        strategyContract={strategyContract}
        refresh={refresh}
      />
    ),
  };
};
