import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { useContracts } from "@/providers/contracts-provider";
import { useSelectShop } from "@/providers/select-shop-provider";

export function SetPayoutAddressCard({ className }: { className?: string }) {
  const { shop, shopContract } = useSelectShop();
  const [payoutAddress, setPayoutAddress] = useState("");
  const { wallets } = useWallets();
  const { publicClient, walletClient } = useContracts();

  const getPayoutAddress = async () => {
    const address = await shopContract.read.payoutAddress();
    setPayoutAddress(address);
  };

  useEffect(() => {
    if (!shopContract) return;
    getPayoutAddress();
  }, [shopContract]); // eslint-disable-line react-hooks/exhaustive-deps

  const updatePayoutAddress = async (address: string) => {
    try {
      if (!isAddress(address)) {
        throw new Error("Invalid address");
      }
      if (!wallets || wallets.length === 0) {
        throw new Error("No wallet found");
      }

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await shopContract.write.setPayoutAddress([address]);
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
        description: "Updated address successfully",
      });
      setPayoutAddress("");
      await getPayoutAddress();
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
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Update Shop Payout Address</CardTitle>
        <CardDescription>
          Update payout address for <b>{shop?.name}</b>.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8">
        <div className="grid gap-3 ">
          <Label htmlFor="payout-address">Payout Address</Label>
          <Input
            id="payout-address"
            placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            onChange={(e) => setPayoutAddress(e.target.value)}
            value={payoutAddress}
            type="text"
          />
        </div>
      </CardContent>
      <CardFooter>
        <div className="items-center gap-2 md:ml-auto">
          <Button
            variant="default"
            onClick={() => updatePayoutAddress(payoutAddress)}
          >
            Update
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
