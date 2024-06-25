export const abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_shopAddress",
        type: "address",
        internalType: "address",
      },
      { name: "_bps", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_BPS",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "bps",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateFee",
    inputs: [
      { name: "price", type: "uint256", internalType: "uint256" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoleAdmin",
    inputs: [{ name: "role", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
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
    name: "grantRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      {
        name: "callerConfirmation",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setBps",
    inputs: [{ name: "_bps", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "previousAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "newAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "AccessControlBadConfirmation", inputs: [] },
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "neededRole", type: "bytes32", internalType: "bytes32" },
    ],
  },
  { type: "error", name: "MathOverflowedMulDiv", inputs: [] },
] as const;

export const bytecode =
  "0x608060405234801561001057600080fd5b5060405161083b38038061083b83398101604081905261002f916100ab565b600180546001600160a01b0319166001600160a01b03841617905560025461271010156100a25760405162461bcd60e51b815260206004820152601360248201527f6270732065786365656473204d41585f42505300000000000000000000000000604482015260640160405180910390fd5b600255506100e5565b600080604083850312156100be57600080fd5b82516001600160a01b03811681146100d557600080fd5b6020939093015192949293505050565b610747806100f46000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c8063682373291161007157806368237329146101835780637d82b35b1461018c57806391d148541461019f578063a217fddf146101b2578063d547741f146101ba578063fd967f47146101cd57600080fd5b806301ffc9a7146100b957806315dae03e146100e1578063248a9ca3146101175780632f2ff15d1461014857806336568abe1461015d578063400ba06914610170575b600080fd5b6100cc6100c7366004610600565b6101d6565b60405190151581526020015b60405180910390f35b604080518082018252601481527350455243454e544147455f4645455f534841524560601b602082015290516100d8919061062a565b61013a610125366004610678565b60009081526020819052604090206001015490565b6040519081526020016100d8565b61015b6101563660046106ad565b61020d565b005b61015b61016b3660046106ad565b610238565b61013a61017e3660046106ad565b610270565b61013a60025481565b61015b61019a366004610678565b610288565b6100cc6101ad3660046106ad565b6103a7565b61013a600081565b61015b6101c83660046106ad565b6103d0565b61013a61271081565b60006001600160e01b03198216637965db0b60e01b148061020757506301ffc9a760e01b6001600160e01b03198316145b92915050565b600082815260208190526040902060010154610228816103f5565b6102328383610402565b50505050565b6001600160a01b03811633146102615760405163334bd91960e11b815260040160405180910390fd5b61026b8282610494565b505050565b6000610281836002546127106104ff565b9392505050565b600154604051632474521560e21b8152600060048201523360248201526001600160a01b03909116906391d1485490604401602060405180830381865afa1580156102d7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102fb91906106d9565b61035a5760405162461bcd60e51b815260206004820152602560248201527f4f6e6c792073686f702064656661756c742061646d696e2063616e2063616c6c604482015264207468697360d81b60648201526084015b60405180910390fd5b6127108111156103a25760405162461bcd60e51b81526020600482015260136024820152726270732065786365656473204d41585f42505360681b6044820152606401610351565b600255565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b6000828152602081905260409020600101546103eb816103f5565b6102328383610494565b6103ff81336105c3565b50565b600061040e83836103a7565b61048c576000838152602081815260408083206001600160a01b03861684529091529020805460ff191660011790556104443390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a4506001610207565b506000610207565b60006104a083836103a7565b1561048c576000838152602081815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a4506001610207565b60008383028160001985870982811083820303915050806000036105365783828161052c5761052c6106fb565b0492505050610281565b8084116105565760405163227bc15360e01b815260040160405180910390fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b6105cd82826103a7565b6105fc5760405163e2517d3f60e01b81526001600160a01b038216600482015260248101839052604401610351565b5050565b60006020828403121561061257600080fd5b81356001600160e01b03198116811461028157600080fd5b600060208083528351808285015260005b818110156106575785810183015185820160400152820161063b565b506000604082860101526040601f19601f8301168501019250505092915050565b60006020828403121561068a57600080fd5b5035919050565b80356001600160a01b03811681146106a857600080fd5b919050565b600080604083850312156106c057600080fd5b823591506106d060208401610691565b90509250929050565b6000602082840312156106eb57600080fd5b8151801515811461028157600080fd5b634e487b7160e01b600052601260045260246000fdfea2646970667358221220b35d34ffe98b9a7539e006a11d14828d8822d3dde9192efade75f3f8675d2c2264736f6c63430008140033";
