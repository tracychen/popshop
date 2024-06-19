// These styles apply to every route in the application
import "./globals.css";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import WalletProvider from "@/providers/WalletProvider";
import { authOptions } from "@/lib/auth";
import { Inter } from "@next/font/google";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";

export const metadata: Metadata = {
  title: "starter",
  description: "starter template for Next.js",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={inter.className}>
      <body
        suppressHydrationWarning={true}
        className={cn("min-h-screen bg-background")}
      >
        <WalletProvider session={session}>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
