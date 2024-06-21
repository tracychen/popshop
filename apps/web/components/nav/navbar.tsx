"use client";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Loader } from "../ui/loader";
import { LogInButton } from "./login-button";
import Logo from "./logo";
import { UserMenu } from "./user-menu";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, user } = usePrivy();

  return (
    <div className="absolute top-0 z-20 flex w-full items-center justify-between p-4 md:p-10">
      <div className="flex items-center gap-x-2">
        <Link href="/" className="flex items-center gap-x-2">
          <Logo
            className={cn(
              "hover:animate-spin",
              pathname === "/" ? "text-primary-foreground" : "text-primary",
            )}
          />
          {pathname !== "/" && (
            <span className="font-sniglet text-2xl text-primary">popshop*</span>
          )}
        </Link>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <Button variant="default" onClick={() => router.push("/shop")}>
          Shop
        </Button>
        {ready ? (
          !user ? (
            <LogInButton>Connect Wallet</LogInButton>
          ) : (
            <UserMenu user={user} />
          )
        ) : (
          <Loader className="h-4 w-4" />
        )}
      </div>
    </div>
  );
}
