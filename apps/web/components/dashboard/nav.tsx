"use client";
import {
  Basket,
  Package,
  Plus,
  Storefront,
  TreeView,
  Wrench,
} from "@phosphor-icons/react";

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function DashboardNav({ children }: { children?: React.ReactNode }) {
  const tabs = [
    { name: "Shop Dashboard", link: "/dashboard", icon: Storefront },
    { name: "Orders", link: "/dashboard/orders", icon: Basket },
    { name: "Products", link: "/dashboard/products", icon: Package },
    // { name: "Customers", link: "/dashboard/customers", icon: UsersThree },
    // { name: "Analytics", link: "/dashboard/analytics", icon: TrendUp },
    { name: "Add Product", link: "/dashboard/create", icon: Plus },
    { name: "Strategies", link: "/dashboard/strategies", icon: TreeView },
    { name: "Settings", link: "/dashboard/settings", icon: Wrench },
  ];

  return (
    <>
      <TooltipProvider>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <DashboardSidebar tabs={tabs} />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <DashboardHeader tabs={tabs} />
            {children}
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}
