import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Home | starter",
};

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="flex flex-col gap-y-10">
      Welcome to the home page, current user: {currentUser?.evmAddress}
    </div>
  );
}
