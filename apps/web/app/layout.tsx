// These styles apply to every route in the application
import "./globals.css";

import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/AuthProvider";
import {
  Inter,
  Open_Sans,
  Poppins,
  Roboto_Mono,
  Sniglet,
} from "@next/font/google";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "popshop",
  description: "popshop is a platform for onchain commerce",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

const sniglet = Sniglet({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sniglet",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sniglet.variable} ${robotoMono.variable} ${openSans.variable} ${poppins.variable}`}
    >
      <body
        suppressHydrationWarning={true}
        className={cn("min-h-screen bg-background")}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
