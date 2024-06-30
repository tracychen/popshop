import { ProductsPage } from "@/components/shops/products/products-page";

export const metadata = {
  title: "Shop | popshop*",
};

export default async function Page({
  params,
}: {
  params: { shopAddress: string };
}) {
  return <ProductsPage shopAddress={params.shopAddress} />;
}
