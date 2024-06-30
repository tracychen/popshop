"use client";
import { Flower, List, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

import { UserMenu } from "@/components/nav/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { LogInButton } from "../nav/login-button";

export function ShopNav({ children }: { children: React.ReactNode }) {
  const { ready, user } = usePrivy();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-primary"
          >
            <Flower className="h-6 w-6" weight="fill" />
            <span className="sr-only">popshop*</span>
          </Link>
          <Link
            href="/"
            className="hidden font-sniglet text-2xl text-primary sm:flex"
          >
            popshop*
          </Link>
          <Link
            href="/shops"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Shops
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <List className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="text-md grid gap-6 font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold text-primary"
              >
                <Flower className="h-6 w-6" weight="fill" />
                <span className="sr-only">popshop*</span>
              </Link>
              <Link href="/shops" className="hover:text-foreground">
                Shops
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <MagnifyingGlass
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                weight="fill"
              />
              <Input
                type="search"
                placeholder="Shop search coming soon..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          {!ready && <Loader className="h-4 w-4" />}
          {user && <UserMenu user={user} isHomepage={false} />}
          {ready && !user && <LogInButton variant="secondary" />}
        </div>
      </header>
      {children}
    </div>
  );
}
