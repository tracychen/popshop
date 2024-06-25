export const abi = [
  {
    type: "function",
    name: "calculateReward",
    inputs: [
      { name: "price", type: "uint256", internalType: "uint256" },
      { name: "supply", type: "uint256", internalType: "uint256" },
      { name: "buyer", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getType",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "reward",
    inputs: [
      { name: "buyer", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
