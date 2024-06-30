export const abi = [
  {
    type: "function",
    name: "getAttestationUid",
    inputs: [
      { name: "recipient", type: "address", internalType: "address" },
      { name: "schemaUid", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "index",
    inputs: [
      {
        name: "attestationUid",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AttestationIndexed",
    inputs: [
      {
        name: "indexer",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "schema",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "attestationUid",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
] as const;
