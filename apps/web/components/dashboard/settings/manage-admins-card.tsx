import { Copy } from "@phosphor-icons/react";
import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { isAddress, pad } from "viem";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { useContracts } from "@/providers/contracts-provider";
import { useSelectShop } from "@/providers/select-shop-provider";

const defaultAdminRole = "0x00";

export function ManageAdminsCard({ className }: { className?: string }) {
  const { shop, shopContract } = useSelectShop();
  const [admin, setAdmin] = useState("");
  const { wallets } = useWallets();
  const { publicClient, walletClient } = useContracts();
  const [admins, setAdmins] = useState<string[]>([]);

  const getAdmins = async () => {
    console.log("gettings admins...");
    const count = await shopContract.read.getRoleMemberCount([
      pad(defaultAdminRole),
    ]);

    const admins = [];
    for (let i = 0; i < count; i++) {
      const admin = await shopContract.read.getRoleMember([
        pad(defaultAdminRole),
        i,
      ]);
      admins.push(admin);
    }

    console.log(admins);

    // filter out owner
    const owner = await shopContract.read.owner();
    const filteredAdmins = admins.filter((a) => a !== owner);
    setAdmins(filteredAdmins);
  };

  useEffect(() => {
    if (!shopContract) return;
    getAdmins();
  }, [shopContract]); // eslint-disable-line react-hooks/exhaustive-deps

  const addAdmin = async (address: string) => {
    try {
      if (!isAddress(address)) {
        throw new Error("Invalid address");
      }
      if (!wallets || wallets.length === 0) {
        throw new Error("No wallet found");
      }

      const isAdmin = await shopContract.read.hasRole([
        pad(defaultAdminRole),
        address,
      ]);
      if (isAdmin) {
        throw new Error("Address is already an admin");
      }

      // @ts-ignore
      await walletClient.switchChain({ id: chain.id });

      const hash = await shopContract.write.addAdmin([address]);
      // @ts-ignore
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      if (receipt.status !== "success") {
        throw new Error("Transaction failed, hash: " + hash);
      }
      toast({
        title: "Success",
        description: "Added admin successfully",
      });
      setAdmin("");
      await getAdmins();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error adding admin. Please contact us or try again later.",
        variant: "destructive",
      });
    }
  };

  const removeAdmin = async (address: string) => {
    try {
      if (!isAddress(address)) {
        throw new Error("Invalid address");
      }
      if (!wallets || wallets.length === 0) {
        throw new Error("No wallet found");
      }

      const isAdmin = await shopContract.read.hasRole([
        pad(defaultAdminRole),
        address,
      ]);
      if (!isAdmin) {
        throw new Error("Address is not an admin");
      }

      const owner = await shopContract.read.owner();
      if (owner === address) {
        throw new Error("Cannot remove owner");
      }

      const hash = await shopContract.write.removeAdmin([address]);
      // @ts-ignore
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });
      if (receipt.status !== "success") {
        throw new Error("Transaction failed, hash: " + hash);
      }
      toast({
        title: "Success",
        description: "Removed admin successfully",
      });
      setAdmin("");
      await getAdmins();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Error removing admin. Please contact us or try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Manage Admins</CardTitle>
        <CardDescription>
          Add or remove admins from <b>{shop?.name}</b>.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8">
        <div className="grid gap-3 text-sm">
          <Label>Admins</Label>
          <ul className="list-inside list-none">
            {admins.map((admin) => (
              <li key={admin} className="flex items-center gap-x-1">
                {admin}
                <Copy
                  className="cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(admin)}
                />
              </li>
            ))}
          </ul>
        </div>
        <Input
          placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
          onChange={(e) => setAdmin(e.target.value)}
          value={admin}
          type="text"
        />
        <div className="flex items-center gap-2 md:ml-auto">
          <Button variant="destructive" onClick={() => removeAdmin(admin)}>
            Remove
          </Button>
          <Button variant="default" onClick={() => addAdmin(admin)}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
