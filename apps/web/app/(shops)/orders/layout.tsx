export const metadata = {
  title: "Orders | popshop*",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="h-full min-h-screen bg-secondary">{children}</main>;
}
