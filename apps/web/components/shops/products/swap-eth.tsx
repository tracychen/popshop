import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { chain } from "@/lib/chain";
import { contracts } from "@/lib/contracts";
import type { BuildSwapTransaction } from "@coinbase/onchainkit/swap";
import {
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapToggleButton,
} from "@coinbase/onchainkit/swap";
import type { Token } from "@coinbase/onchainkit/token";
import { useSendTransaction, useWallets } from "@privy-io/react-auth";
import { useCallback, useState } from "react";

export default function SwapEth({ children }: { children?: React.ReactNode }) {
  const { ready, wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const [open, setOpen] = useState(false);

  const ETHToken: Token = {
    address: "",
    chainId: chain.id,
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
    image:
      "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  };

  const USDCToken: Token = {
    address: contracts.USDC.address as `0x${string}`,
    chainId: chain.id,
    decimals: 6,
    name: "USDC",
    symbol: "USDC",
    image: "https://basescan.org/token/images/centre-usdc_28.png",
  };

  const onSubmit = useCallback(
    async (swapTransaction: BuildSwapTransaction) => {
      const { transaction } = swapTransaction;
      console.log("Prepared swapTransaction:", transaction);
      // Transaction submission sample code
      const result = await sendTransaction({
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
      });
    },
    [sendTransaction],
  );

  return (
    <>
      {ready && wallets && wallets.length && (
        <Dialog
          open={open}
          onOpenChange={async (isOpen) => {
            setOpen(isOpen);
          }}
        >
          <DialogTrigger asChild>{children}</DialogTrigger>

          <DialogContent x-chunk="dashboard-07-chunk-0">
            <Swap address={wallets[0].address as `0x${string}`}>
              <SwapAmountInput label="Sell" token={USDCToken} type="from" />
              <SwapToggleButton />
              <SwapAmountInput label="Buy" token={ETHToken} type="to" />
              <SwapButton onSubmit={onSubmit} />
              <SwapMessage />
            </Swap>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
