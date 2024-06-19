import { SettingsMenu } from "@/components/settings/settings-menu";

const sidebarNavItems = [
  {
    title: "Account",
    href: "/settings",
  },
  {
    title: "Display",
    href: "/settings",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <div className="space-y-6 p-10 pb-16">
        <div className="space-y-1">
          <h2 className="text-xl tracking-tight selection:font-semibold">
            Settings
          </h2>
          <p className="text-muted-foreground">Manage your settings.</p>
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
