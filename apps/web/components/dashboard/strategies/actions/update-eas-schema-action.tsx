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
  schemaUid: z.string().refine((v) => v.length === 66, {
    message: "Please enter a valid schema UID",
  }),
  indexerAddress: z.string().refine((v) => isAddress(v), {
    message: "Invalid address",
  }),
});

type UpdateEASSchemaFormData = z.infer<typeof schema>;

function UpdateEASSchemaAction({
  initialSchemaUid,
  initialIndexerAddress,
  strategyContract,
  refresh,
}: {
  initialSchemaUid: string;
  initialIndexerAddress: string;
  strategyContract: any;
  refresh: () => Promise<void>;
}) {
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateEASSchemaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      schemaUid: initialSchemaUid,
      indexerAddress: initialIndexerAddress as `0x${string}`,
    },
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();

  async function updateSchemaUid(schemaUid: string) {
    toast({
      title: "Processing",
      description: "Sending transaction to update schema uid...",
    });
    const hash = await strategyContract.write.setSchemaUid([schemaUid]);
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

  async function updateIndexerAddress(indexerAddress: string) {
    toast({
      title: "Processing",
      description: "Sending transaction to update indexer...",
    });
    const hash = await strategyContract.write.setIndexer([indexerAddress]);
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

  async function onSubmit(data: UpdateEASSchemaFormData) {
    setIsSaving(true);
    try {
      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });
      if (data.schemaUid !== initialSchemaUid) {
        await updateSchemaUid(data.schemaUid);
      }
      if (data.indexerAddress !== initialIndexerAddress) {
        await updateIndexerAddress(data.indexerAddress);
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
        <Label htmlFor="schemaUid">Schema ID</Label>
        <Input
          id="schemaUid"
          {...register("schemaUid")}
          type="text"
          className="w-full"
          placeholder="0x2f34a2ffe5f87b2f45fbc7c784896b768d77261e2f24f77341ae43751c765a69"
        />
        {errors.schemaUid && (
          <p className="px-1 text-xs text-destructive">
            {errors.schemaUid.message}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="indexerAddress">Indexer Address</Label>
        <Input
          id="indexerAddress"
          {...register("indexerAddress")}
          type="text"
          className="w-full"
          placeholder={zeroAddress}
        />
        {errors.indexerAddress && (
          <p className="px-1 text-xs text-destructive">
            {errors.indexerAddress.message}
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

export const getUpdateEASSchemaAction = ({
  initialSchemaUid,
  initialIndexerAddress,
  strategyContract,
  refresh,
}: {
  initialSchemaUid: string;
  initialIndexerAddress: string;
  strategyContract: any;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "update-eas-schema",
    tabTitle: "Update EAS Schema",
    tabShortTitle: "EAS Schema",
    tabDescription:
      "Update the EAS Schema ID for the strategy and indexer address if needed.",
    tabContent: (
      <UpdateEASSchemaAction
        initialSchemaUid={initialSchemaUid}
        initialIndexerAddress={initialIndexerAddress}
        strategyContract={strategyContract}
        refresh={refresh}
      />
    ),
  };
};
