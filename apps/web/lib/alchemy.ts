import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  apiKey: process.env.ALCHEMY_API_KEY!,
  // This is hardcoded to mainnet as it is just used for ens resolver.
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

export default alchemy;
