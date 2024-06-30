import { ProductsPage } from "@/components/shops/products/products-page";

export default async function Page({
  params,
}: {
  params: { shopAddress: string };
}) {
  return <ProductsPage shopAddress={params.shopAddress} />;
}
