import { SettingsForm } from "@/components/settings/settings-form";
import { getCurrentUser } from "@/lib/session";
import { getUserByAddress } from "@/lib/user";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings | starter",
};

export default async function SettingsPage() {
  let currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const user = await getUserByAddress(currentUser.evmAddress);

  return <SettingsForm user={user} />;
}
