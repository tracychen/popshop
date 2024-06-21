import { SettingsMenu } from "@/components/settings/settings-menu";

const sidebarNavItems = [
  {
    title: "Onchain Verify",
    href: "/create",
  },
  {
    title: "Set Shop Details",
    href: "/create#step-2",
  },
  {
    title: "Reward Strategy",
    href: "/create#step-3",
  },
  {
    title: "Discount Strategy",
    href: "/create#step-4",
  },
  {
    title: "Payment Strategy",
    href: "/create#step-5",
  },
  {
    title: "Referral Strategy",
    href: "/create#step-5",
  },
  {
    title: "Review",
    href: "/create#step-5",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="space-y-6 p-10 pb-16">
        <div className="space-y-1">
          <h2 className="pt-24 text-xl tracking-tight selection:font-semibold">
            Create popshop*
          </h2>
          <p className="text-muted-foreground text-sm">Have issues or want more customization? Reach out to hi@popshop.one</p>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <SettingsMenu items={sidebarNavItems} />
          </aside>
          {children}
        </div>
      </div>
    </>
  );
}
