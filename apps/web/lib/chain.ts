import { anvil, base, baseSepolia, Chain } from "viem/chains";

function getChain() {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (env === "production") {
    return base;
  } else if (env === "preview") {
    return baseSepolia;
  } else {
    return anvil;
  }
}

export const chain: Chain = getChain();
