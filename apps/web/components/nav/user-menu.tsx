"use client";

import {
  Address,
  Badge,
  Avatar as CBKitAvatar,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import {
  ArrowRight,
  Confetti,
  ShoppingCart,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import { useLogout, User } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import { cn, truncateString } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { chain } from "@/lib/chain";
import { coinbaseVerifiedAccountSchema } from "@/lib/eas";
import Link from "next/link";
import { Icons } from "../icons";

export function UserMenu({
  user,
  isHomepage,
}: {
  user: User;
  isHomepage: boolean;
}) {
  const router = useRouter();

  const { logout } = useLogout();
  const address = user.wallet?.address as `0x${string}`;
  const username = truncateString(address || "");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-x-2 hover:cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.farcaster?.pfp || undefined}
              alt={username}
            />
            <AvatarFallback className="bg-transparent">
              <Icons.rabbit
                className={cn(
                  "h-8 w-8",
                  isHomepage ? "text-primary-foreground" : "text-primary",
                )}
                weight="fill"
              />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <Identity
              address={address}
              schemaId={coinbaseVerifiedAccountSchema}
            >
              <CBKitAvatar address={address} />
              <Name className="text-sm font-medium leading-none">
                <Badge />
              </Name>
              <Address className="text-xs leading-none text-muted-foreground" />
            </Identity>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => router.push("/shops")}
          >
            <ShoppingCart className="mr-2 h-4 w-4" weight="fill" />
            Explore
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => router.push("/dashboard")}
          >
            <Storefront className="mr-2 h-4 w-4" weight="fill" />
            Manage Shops
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              toast({
                title: "Coming soon!",
                description: "Rewards dashboard is not available yet.",
              });
            }}
          >
            <Confetti className="mr-2 h-4 w-4" weight="fill" />
            Rewards
          </DropdownMenuItem>
          {/* <DropdownMenuItem className="cursor-pointer">
            <Question className="mr-2 h-4 w-4" weight="fill" />
            Support
          </DropdownMenuItem> */}
          <DropdownMenuItem>
            {chain.testnet ? (
              <Link href="https://popshop.fun/" target="_blank">
                <ArrowRight className="mr-2 inline h-4 w-4" weight="fill" />
                Try Mainnet
              </Link>
            ) : (
              <Link href="https://sepolia.popshop.fun/" target="_blank">
                <ArrowRight className="mr-2 inline h-4 w-4" weight="fill" />
                Try Testnet
              </Link>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async (event) => {
            event.preventDefault();
            logout();
            router.push("/");
            toast({
              title: "Signed out",
              description: "You have been signed out.",
            });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
