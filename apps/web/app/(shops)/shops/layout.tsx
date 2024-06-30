export const metadata = {
  title: "Shop | popshop*",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="h-full min-h-screen bg-secondary">{children}</main>;
}
