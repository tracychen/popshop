"use client";
import { Flower, Sidebar } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { UserMenu } from "../nav/user-menu";
import { ShopSelect } from "./shop-select";

export function DashboardHeader({
  tabs,
}: {
  tabs: { name: string; link: string; icon: any }[];
}) {
  const { ready, user } = usePrivy();

  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      router.push("/");
    }
  }, [router, ready, user]);

  const pathname = usePathname();

  const pageName = tabs.find((tab) => tab.link === pathname)?.name;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Sidebar className="h-5 w-5" weight="fill" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Flower
                className="h-5 w-5 transition-all group-hover:scale-110"
                weight="fill"
              />
              <span className="sr-only">popshop*</span>
            </Link>
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.link}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <span className="hidden font-sniglet text-2xl text-primary sm:flex">
        popshop*
      </span>
      <p className="hidden text-sm font-medium sm:flex">{pageName}</p>
      <div className="relative ml-auto flex-1 md:grow-0">
        <ShopSelect />
      </div>
      {!ready && <Loader className="h-4 w-4" />}
      {user && <UserMenu user={user} isHomepage={false} />}
    </header>
  );
}
