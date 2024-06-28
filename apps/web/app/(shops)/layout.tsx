import { ShopNav } from "@/components/shops/shop-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShopNav>{children}</ShopNav>;
}
