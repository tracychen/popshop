import { Navbar } from "@/components/nav/navbar";

export default async function Layout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex w-full flex-1 flex-col overflow-hidden ">
        {children}
      </main>
    </>
  );
}
