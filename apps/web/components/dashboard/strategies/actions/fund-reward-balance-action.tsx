import { zodResolver } from "@hookform/resolvers/zod";
import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { formatUnits, parseEther } from "viem";
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
  numTokens: z.number().int().positive().min(1),
});

type FundRewardBalanceFormData = z.infer<typeof schema>;

function FundRewardBalanceAction({
  symbol,
  decimals,
  tokenContract,
  strategyAddress,
  refresh,
}: {
  symbol: string;
  decimals: number;
  tokenContract: any;
  strategyAddress: string;
  refresh: () => Promise<void>;
}) {
  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<FundRewardBalanceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState();

  useEffect(() => {
    async function fetchBalance() {
      const tokenBalance = await tokenContract.read.balanceOf([
        wallets[0].address,
      ]);
      setBalance(tokenBalance);
    }
    if (wallets.length > 0) {
      fetchBalance();
    }
  }, [wallets]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: FundRewardBalanceFormData) {
    setIsSaving(true);
    try {
      // check my token balance
      const wallet = wallets[0];
      const tokenBalance = await tokenContract.read.balanceOf([wallet.address]);
      if (BigInt(data.numTokens) > BigInt(tokenBalance)) {
        throw new Error("Insufficient balance to fund");
      }

      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await tokenContract.write.transfer([
        strategyAddress,
        data.numTokens,
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
        description: "Funded successfully",
      });
      reset();
      await refresh();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error funding. Please contact us or try again later.",
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
        <Label htmlFor="numTokens">Number of Tokens</Label>
        <Input
          id="numTokens"
          {...register("numTokens", { valueAsNumber: true })}
          type="number"
          className="w-full"
          placeholder={parseEther("10").toString()}
        />
        {errors.numTokens && (
          <p className="px-1 text-xs text-destructive">
            {errors.numTokens.message}
          </p>
        )}
        {watch("numTokens") > 0 && (
          <p className="text-xs">
            {`This will increase the remaining reward supply by ${formatUnits(
              BigInt(watch("numTokens")),
              decimals,
            )} ${symbol}.`}
          </p>
        )}
        {balance && (
          <div className="text-xs text-muted-foreground">
            Your Balance:{" "}
            {`${formatUnits(BigInt(balance), decimals)} ${symbol}`}
          </div>
        )}
      </div>
      <Button
        size="sm"
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-x-2"
      >
        {isSaving && <Loader className="h-4 w-4 text-primary-foreground" />}
        Fund
      </Button>
    </form>
  );
}

export const getFundRewardBalanceAction = ({
  symbol,
  decimals,
  tokenContract,
  strategyAddress,
  refresh,
}: {
  symbol: string;
  decimals: number;
  tokenContract: any;
  strategyAddress: string;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "fund-reward-balance",
    tabTitle: "Fund Reward Supply",
    tabShortTitle: "Fund",
    tabDescription: "Add more tokens to the reward supply for this strategy.",
    tabContent: (
      <FundRewardBalanceAction
        symbol={symbol}
        decimals={decimals}
        tokenContract={tokenContract}
        strategyAddress={strategyAddress}
        refresh={refresh}
      />
    ),
  };
};
