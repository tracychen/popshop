import { ProductPage } from "@/components/shops/products/product-page";

export default function Page({
  params,
}: {
  params: { shopAddress: string; productId: number };
}) {
  return (
    <ProductPage
      shopAddress={params.shopAddress}
      productId={params.productId}
    />
  );
}
