"use client";
import { User } from "next-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Logo from "./logo";
import { UserMenu } from "./user-menu";
import WalletConnectButton from "./wallet-connect-button";

export function Navbar({ user }: { user: User }) {
  const router = useRouter();

  return (
    <div className="absolute top-0 z-20 flex w-full items-center justify-between p-4 md:p-10">
      <div className="flex items-center gap-x-2">
        <Link href="/" className="flex items-center gap-x-2">
          <div className="w-24 sm:w-[112px]">
            <Logo className="text-primary-foreground hover:animate-spin" />
          </div>
        </Link>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <Button variant="secondary" onClick={() => router.push("/shop")}>
          Shop
        </Button>
        {!user ? (
          <WalletConnectButton />
        ) : (
          <>
            <UserMenu user={user} />
          </>
        )}
      </div>
    </div>
  );
}
