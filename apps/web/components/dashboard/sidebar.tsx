"use client";
import { Flower } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function DashboardSidebar({
  tabs,
}: {
  tabs: { name: string; link: string; icon: any }[];
}) {
  const pathname = usePathname();

  const isCurrentPage = (link: string) => pathname === link;
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Flower
            className="h-4 w-4 transition-all group-hover:scale-110"
            weight="fill"
          />
          <span className="sr-only">popshop*</span>
        </Link>

        {tabs.map((tab) => (
          <Tooltip key={tab.name}>
            <TooltipTrigger asChild>
              <Link
                href={tab.link}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                  isCurrentPage(tab.link) && "bg-accent text-accent-foreground",
                )}
              >
                <tab.icon className="h-5 w-5" weight="fill" />
                <span className="sr-only">{tab.name}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{tab.name}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </aside>
  );
}
