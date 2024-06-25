export const abi = [
  {
    type: "function",
    name: "calculateDiscount",
    inputs: [
      { name: "price", type: "uint256", internalType: "uint256" },
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
] as const;
