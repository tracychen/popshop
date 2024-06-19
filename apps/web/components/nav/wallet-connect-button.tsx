"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function WalletConnectButton() {
  const router = useRouter();
  return (
    <>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          if (connected) {
            router.refresh();
          }

          return (
            <>
              {!connected ? (
                <>
                  <Button
                    onClick={openConnectModal}
                    variant="default"
                    size="full"
                  >
                    Connect Wallet
                  </Button>
                </>
              ) : (
                <div className="flex justify-center">
                  <ConnectButton chainStatus={"none"} showBalance={false} />
                </div>
              )}
            </>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
}
