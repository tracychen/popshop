import { usePrivy, useWallets } from "@privy-io/react-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

export function BecomeReferrerCard({
  shopAddress,
  productId,
}: {
  shopAddress: string;
  productId: number;
}) {
  const { ready, user } = usePrivy();
  const { wallets } = useWallets();

  const copyReferralLink = async () => {
    try {
      if (!wallets || wallets.length === 0) {
        throw new Error("No wallet found");
      }

      const wallet = wallets[0];
      const referralLink = `${window.location.origin}/shops/${shopAddress}/products/${productId}?ref=${wallet.address}`;
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Referral link copied",
        description: "You can now share your referral link with your friends.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An error occurred while copying the referral link.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card x-chunk="dashboard-07-chunk-5">
      <CardHeader>
        <CardTitle>Become a referrer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="text-sm text-muted-foreground">
            {ready && !user && "Please login to get your referral link."}
            {ready &&
              user &&
              "Check the product fee share description or contact the shop owner to for details!"}
          </div>
          {!ready && (
            <div className="grid gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {ready && user && (
            <Button size="sm" variant="secondary" onClick={copyReferralLink}>
              Copy referral link
            </Button>
            //   todo social share buttons
          )}
        </div>
      </CardContent>
    </Card>
  );
}
