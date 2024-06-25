"use client";
import { ArrowSquareOut } from "@phosphor-icons/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { chain } from "@/lib/chain";
import { useSelectShop } from "@/providers/select-shop-provider";

import { CreateShopForm } from "./create-shop-form";

export function HomeDashboard() {
  const { shop } = useSelectShop();
  // TODO you must onchain verify to unlock create shop
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-4" x-chunk="dashboard-05-chunk-0">
          <CardHeader className="pb-3">
            <CardTitle>Welcome to your popshop* dashboard</CardTitle>
            <CardDescription className="max-w-lg leading-relaxed">
              {shop ? (
                <>
                  You are currently viewing the shop dashboard for{" "}
                  <b>{shop.name}</b>. Your shop is deployed at:{" "}
                  <a
                    href={`${chain.blockExplorers?.default.url}/address/${shop.shopAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {shop.shopAddress}
                  </a>
                </>
              ) : (
                <>
                  Please select a shop through the above dropdown or create a
                  new shop.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-3">
            <CreateShopForm>
              <Button>Create New Shop</Button>
            </CreateShopForm>
            {shop && (
              <Button variant="outline">
                <Link
                  href={`/shops/${shop.shopAddress}`}
                  className="flex items-center"
                  target="_blank"
                >
                  View Shop
                  <ArrowSquareOut className="ml-2 h-4 w-4" weight="fill" />
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8"></div>
    </main>
  );
}
