import { ShopNav } from "@/components/shops/shop-nav";

export const metadata = {
  title: "popshop*",
  description: "incentivized social commerce",
  openGraph: {
    title: "popshop*",
    description: "incentivized social commerce",
    locale: "en_US",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "popshop*",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShopNav>{children}</ShopNav>;
}
