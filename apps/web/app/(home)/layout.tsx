import { Navbar } from "@/components/nav/navbar";
import { getCurrentUser } from "@/lib/session";

interface HomeLayoutProps {
  children?: React.ReactNode;
}

export default async function HomeLayout({ children }: HomeLayoutProps) {
  const user = await getCurrentUser();

  return (
    <>
      <Navbar user={user} />
      <main className="flex w-full flex-1 flex-col overflow-hidden ">
        {children}
      </main>
    </>
  );
}
