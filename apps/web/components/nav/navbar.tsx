"use client";
import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "../ui/button";
import { Loader } from "../ui/loader";
import { LogInButton } from "./login-button";
import { UserMenu } from "./user-menu";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, user } = usePrivy();

  const isHomepage = pathname === "/";

  return (
    <div className="absolute top-0 z-20 flex w-full items-center justify-between p-4 md:p-10">
      <p className="text-xs text-muted">(in alpha)</p>
      <div className="ml-auto flex items-center space-x-4">
        <Button variant="secondary" onClick={() => router.push("/shops")}>
          Shop
        </Button>
        {ready ? (
          !user ? (
            <LogInButton variant={isHomepage ? "secondary" : "default"} />
          ) : (
            <>
              <UserMenu user={user} isHomepage={isHomepage} />
            </>
          )
        ) : (
          <Loader className="h-4 w-4 text-secondary" />
        )}
      </div>
    </div>
  );
}
