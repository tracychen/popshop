"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSelectShop } from "@/providers/select-shop-provider";

import { ManageAdminsCard } from "./settings/manage-admins-card";
import { SetPayoutAddressCard } from "./settings/set-payout-address-card";

export function SettingsDashboard() {
  const { shop } = useSelectShop();
  if (!shop) {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Shop Settings</CardTitle>
            <CardDescription>
              You must select a shop to view shop settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <ManageAdminsCard className="sm:col-span-2" />
        <SetPayoutAddressCard className="sm:col-span-2" />
      </div>
    </main>
  );
}
