"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export function AuthProvider({ children }: { children?: React.ReactNode }) {
  return (
    <PrivyProvider appId="clxo3etkc00obqo7nwp6o33ra">{children}</PrivyProvider>
  );
}
