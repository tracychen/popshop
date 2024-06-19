"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { truncateString } from "@/lib/utils";
import { disconnect } from "@wagmi/core";
import { useRouter } from "next/navigation";
import { Icons } from "../icons";
import { User } from "next-auth";

export function UserMenu({ user }: { user: User }) {
  const router = useRouter();

  const username = truncateString(user.evmAddress);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-x-2 hover:cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.imageUrl} alt={username} />
            <AvatarFallback>
              <Icons.user className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <Icons.caretdown className="hidden h-4 w-4 sm:block" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {username || truncateString(user.evmAddress)}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {truncateString(user.evmAddress)}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => router.push("/settings")}
          >
            <Icons.settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={async (event) => {
            event.preventDefault();
            await disconnect();
            await signOut({
              callbackUrl: "/",
            });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
