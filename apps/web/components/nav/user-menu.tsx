"use client";

import { truncateString } from "@/lib/utils";

import { useLogout, User } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Icons } from "../icons";
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

export function UserMenu({ user }: { user: User }) {
  const router = useRouter();

  const { logout } = useLogout();

  const username = truncateString(user.wallet?.address);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-x-2 hover:cursor-pointer">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.farcaster?.pfp} alt={username} />
            <AvatarFallback>
              <Icons.user className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          {/* <Icons.caretdown className="hidden h-4 w-4 sm:block" /> */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {truncateString(user.wallet?.address)}
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
            logout();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
