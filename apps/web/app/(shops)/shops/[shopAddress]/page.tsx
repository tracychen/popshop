import { ShopPage } from "@/components/shops/shop-page";

export const metadata = {
  title: "Shop | popshop*",
};

export default async function Page({
  params,
}: {
  params: { shopAddress: string };
}) {
  return <ShopPage shopAddress={params.shopAddress} />;
}
