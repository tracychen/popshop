import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isAddress, zeroAddress } from "viem";
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
  shopToken: z.string().refine((v) => isAddress(v), {
    message: "Invalid address",
  }),
});

type UpdateShopTokenFormData = z.infer<typeof schema>;

function UpdateShopTokenAction({
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
  } = useForm<UpdateShopTokenFormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();

  async function onSubmit(data: UpdateShopTokenFormData) {
    setIsSaving(true);
    try {
      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await strategyContract.write.updateShopToken([
        data.shopToken,
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
        <Label htmlFor="minBalance">Token Address</Label>
        <Input
          id="shopToken"
          {...register("shopToken")}
          type="text"
          className="w-full"
          placeholder={zeroAddress}
        />
        {errors.shopToken && (
          <p className="px-1 text-xs text-destructive">
            {errors.shopToken.message}
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

export const getUpdateShopTokenAction = ({
  strategyContract,
  refresh,
}: {
  strategyContract: any;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "update-shop-token",
    tabTitle: "Update Token For Strategy",
    tabShortTitle: "Token",
    tabDescription:
      "Update the token address for this strategy. If using this token as a reward strategy, make sure you withdraw reward supply before updating the token.",
    tabContent: (
      <UpdateShopTokenAction
        strategyContract={strategyContract}
        refresh={refresh}
      />
    ),
  };
};
