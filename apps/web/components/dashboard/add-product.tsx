"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelectShop } from "@/providers/select-shop-provider";

import { AddProductForm } from "./add-product-form";

export function AddProductDashboard() {
  const { shop } = useSelectShop();
  // TODO you must onchain verify to create shop

  if (!shop) {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        {/* do not allow creation */}
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Create Product</CardTitle>
            <CardDescription>
              You must select a shop to create a product.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <AddProductForm />
    </main>
  );
}
