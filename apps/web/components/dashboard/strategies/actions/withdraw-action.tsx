import { useEffect, useState } from "react";
import { formatUnits } from "viem";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { useContracts } from "@/providers/contracts-provider";

import { ActionDialogTab } from "./action-dialog";

function WithdrawAction({
  symbol,
  decimals,
  tokenContract,
  strategyContract,
  strategyAddress,
  refresh,
}: {
  symbol: string;
  decimals: number;
  tokenContract: any;
  strategyContract: any;
  strategyAddress: string;
  refresh: () => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const { publicClient, walletClient } = useContracts();

  const [balance, setBalance] = useState();

  useEffect(() => {
    async function fetchBalance() {
      const tokenBalance = await tokenContract.read.balanceOf([
        strategyAddress,
      ]);
      setBalance(tokenBalance);
    }
    fetchBalance();
  }, [strategyAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  async function withdraw() {
    setIsSaving(true);
    try {
      // check the token balance on contract
      const tokenBalance = await tokenContract.read.balanceOf([
        strategyAddress,
      ]);
      if (BigInt(tokenBalance) === BigInt(0)) {
        throw new Error("No balance to withdraw");
      }

      toast({
        title: "Processing",
        description: "Sending transaction...",
      });

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await strategyContract.write.withdraw();
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
        description: "Withdrew successfully",
      });
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
    <div className="grid gap-3">
      {balance && (
        <div className="text-xs text-muted-foreground">
          Strategy Balance:{" "}
          {`${formatUnits(BigInt(balance), decimals)} ${symbol}`}
        </div>
      )}
      <Button
        size="sm"
        onClick={withdraw}
        disabled={isSaving}
        className="flex items-center gap-x-2"
      >
        {isSaving && <Loader className="h-4 w-4 text-primary-foreground" />}
        Withdraw
      </Button>
    </div>
  );
}

export const getWithdrawAction = ({
  symbol,
  decimals,
  tokenContract,
  strategyContract,
  strategyAddress,
  refresh,
}: {
  symbol: string;
  decimals: number;
  tokenContract: any;
  strategyContract: any;
  strategyAddress: string;
  refresh: () => Promise<void>;
}): ActionDialogTab => {
  return {
    tabValue: "withdraw",
    tabTitle: "Withdraw",
    tabDescription:
      "Withdraw all reward tokens from the strategy to your wallet. This means buyers will no longer be able to get rewards from this strategy.",
    tabContent: (
      <WithdrawAction
        symbol={symbol}
        decimals={decimals}
        tokenContract={tokenContract}
        strategyContract={strategyContract}
        strategyAddress={strategyAddress}
        refresh={refresh}
      />
    ),
  };
};
