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

const BPS_MULTIPLIER = 100;
const MAX_DECIMAL_PLACES = 2;

// Custom validation function to check the number of decimal places
const maxDecimalPlaces = (places: number) => (value: number) => {
  const decimalPart = value.toString().split(".")[1];
  return !decimalPart || decimalPart.length <= places;
};

const schema = z.object({
  addresses: z
    .string()
    .nonempty()
    .refine(
      (v) => {
        const addressList = v.split(",");
        return addressList.every((v) => isAddress(v));
      },
      {
        message: "Please enter valid addresses",
      },
    ),
  percentage: z
    .number()
    .gte(0)
    .lte(BPS_MULTIPLIER)
    .refine(maxDecimalPlaces(MAX_DECIMAL_PLACES), {
      message: `Number must have no more than ${MAX_DECIMAL_PLACES} decimal places`,
    }),
});

type UpdateAllowlistFormData = z.infer<typeof schema>;

function UpdateAllowlistBpsAction({
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
  const [allowlist, setAllowlist] = useState<
    {
      address: string;
      bps: number;
    }[]
  >();

  const getAllowlist = async () => {
    const [addresses, bpses] = await strategyContract.read.getAllowlist();
    const formattedAllowlist = addresses.map(
      (address: string, index: number) => {
        return {
          address: address,
          bps: Number(bpses[index]),
        };
      },
    );
    setAllowlist(formattedAllowlist);
    return allowlist;
  };

  useEffect(() => {
    getAllowlist();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: UpdateAllowlistFormData) {
    setIsSaving(true);
    try {
      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });
      const addressList = data.addresses.split(",");
      const hash = await strategyContract.write.addToAllowlist([
        addressList,
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
          {allowlist?.map(
            ({ address, bps }: { address: string; bps: number }) => (
              <div
                key={address}
                className="flex w-full items-center justify-between gap-2 text-xs"
              >
                <span>
                  {address} - {bps / 100}%
                </span>
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
            ),
          )}
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8"
      >
        <div className="grid gap-3">
          <Label htmlFor="addresses">Add Addresses to Allowlist</Label>
          <Input
            id="addresses"
            {...register("addresses")}
            type="string"
            className="w-full"
            placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
          />
          <p className="px-1 text-xs text-muted-foreground">
            Comma separated list of addresses to add to the allowlist.
          </p>
          {errors.addresses && (
            <p className="px-1 text-xs text-destructive">
              {errors.addresses.message}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="percentage">Percent Discount</Label>
          <Input
            id="percentage"
            {...register("percentage", { valueAsNumber: true })}
            type="number"
            placeholder="12.5"
            step="any"
          />
          <p className="px-1 text-xs text-muted-foreground">
            The buyer will receive a {watch("percentage") || 0}% discount on
            their total purchase price.
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
          Add
        </Button>
      </form>
    </div>
  );
}

export const getUpdateAllowlistBpsAction = ({
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
      "Add or remove addresses from the allowlist. Only addresses on the allowlist are eligible for discounts.",
    tabContent: (
      <UpdateAllowlistBpsAction
        strategyContract={strategyContract}
        refresh={refresh}
      />
    ),
  };
};
