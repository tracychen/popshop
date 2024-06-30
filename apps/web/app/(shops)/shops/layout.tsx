export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* <div className="space-y-6 p-10 pb-16">
        <div className="space-y-1">
          <h2 className="pt-24 text-xl tracking-tight selection:font-semibold">
            Browse Shops
          </h2>
          <p className="text-muted-foreground">
            Discover and shop from the popshop* community.
          </p>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <SettingsMenu items={sidebarNavItems} />
          </aside>
          {children}
        </div>
      </div> */}
    </>
  );
}
