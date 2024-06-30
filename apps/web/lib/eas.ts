import { base } from "viem/chains";
import { chain } from "./chain";

export const coinbaseVerifiedAccountSchema =
  chain.id === base.id
    ? "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
    : "0x2f34a2ffe5f87b2f45fbc7c784896b768d77261e2f24f77341ae43751c765a69";
