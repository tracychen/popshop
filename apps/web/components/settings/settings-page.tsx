"use client";
import { usePrivy } from "@privy-io/react-auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default function SettingsPage() {
    const { ready, user } = usePrivy();
  
    if (ready && !user) {
      redirect("/");
    }
  
    return <SettingsForm user={user} />;
  }
  