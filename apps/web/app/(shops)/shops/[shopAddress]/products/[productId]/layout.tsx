export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:p-6 md:gap-8">
      {children}
    </main>
  );
}
