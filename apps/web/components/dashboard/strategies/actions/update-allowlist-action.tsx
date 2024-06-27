import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { useContracts } from "@/providers/contracts-provider";

import { ActionDialogTab } from "./action-dialog";

const schema = z.object({
  address: z
    .string()
    .nonempty()
    .refine((v) => isAddress(v), {
      message: "Please enter a valid address",
    }),
});

type UpdateAllowlistFormData = z.infer<typeof schema>;

function UpdateAllowlistAction({
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
  } = useForm<UpdateAllowlistFormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();
  const [allowlist, setAllowlist] = useState<string[]>();

  const getAllowlist = async () => {
    const allowlist = await strategyContract.read.getAllowlist();
    setAllowlist(allowlist);
    return allowlist;
  };

  useEffect(() => {
    getAllowlist();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: UpdateAllowlistFormData) {
    setIsSaving(true);
    try {
      const isAllowlisted = await strategyContract.read.isAllowlisted([
        data.address,
      ]);
      if (isAllowlisted) {
        throw new Error("Address is already allowlisted");
      }

      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await strategyContract.write.addToAllowlist([
        [data.address],
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
        description: "Added successfully",
      });
      reset();
      await getAllowlist();
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

  const removeFromAllowlist = async (address: string) => {
    setIsSaving(true);
    try {
      const isAllowlisted = await strategyContract.read.isAllowlisted([
        address,
      ]);
      if (!isAllowlisted) {
        throw new Error("Address is not allowlisted");
      }
      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await strategyContract.write.removeFromAllowlist([
        [address],
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
        description: "Removed successfully",
      });
      await getAllowlist();
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
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="allowlist">Current Allowlist</Label>
        <div className="grid gap-2">
          {allowlist?.map((address) => (
            <div
              key={address}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span>{address}</span>
              <Badge
                className="cursor-pointer"
                variant="destructive"
                onClick={async () => {
                  await removeFromAllowlist(address);
                }}
              >
                Remove
              </Badge>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8"
      >
        <div className="grid gap-3">
          <Label htmlFor="address">Add Address to Allowlist</Label>
          <Input
            id="address"
            {...register("address")}
            type="string"
            className="w-full"
            placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
          />
          {errors.address && (
            <p className="px-1 text-xs text-destructive">
              {errors.address.message}
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
          Add
        </Button>
      </form>
    </div>
  );
}

export const getUpdateAllowlistAction = ({
  strategyContract,
  refresh,
}: {
  strategyContract: any;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "update-allowlist",
    tabTitle: "Update Strategy Allowlist",
    tabShortTitle: "Allowlist",
    tabDescription:
      "Add or remove addresses from the allowlist. Only addresses on the allowlist are eligible to get reawards from the strategy.",
    tabContent: (
      <UpdateAllowlistAction
        strategyContract={strategyContract}
        refresh={refresh}
      />
    ),
  };
};
