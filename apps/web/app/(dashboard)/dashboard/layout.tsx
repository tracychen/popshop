import { DashboardNav } from "@/components/dashboard/nav";
import { SelectShopProvider } from "@/providers/select-shop-provider";

export default async function Layout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <SelectShopProvider>
      <DashboardNav>{children}</DashboardNav>
    </SelectShopProvider>
  );
}
