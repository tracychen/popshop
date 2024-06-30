"use client";
import { usePrivy } from "@privy-io/react-auth";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const { ready, user } = usePrivy();

  if (ready && !user) {
    redirect("/");
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8"></main>
  );
}
