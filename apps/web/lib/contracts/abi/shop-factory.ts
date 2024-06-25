export const abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "registryAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_platformAddress",
        type: "address",
        internalType: "address",
      },
      { name: "_platformFee", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createShop",
    inputs: [
      {
        name: "shopMetadataURI",
        type: "string",
        internalType: "string",
      },
      { name: "initialAdmin", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "platformAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "platformFee",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "registry",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ShopRegistry",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ShopCreated",
    inputs: [
      {
        name: "shopAddress",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "shopMetadataURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "initialAdmin",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;
