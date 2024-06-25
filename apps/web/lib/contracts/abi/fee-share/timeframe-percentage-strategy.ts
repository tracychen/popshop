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
      {
        name: "_startTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_endTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
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
    name: "endTimestamp",
    inputs: [],
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
    name: "setEndTimestamp",
    inputs: [
      {
        name: "_endTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setStartTimestamp",
    inputs: [
      {
        name: "_startTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "startTimestamp",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
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
  "0x608060405234801561001057600080fd5b50604051610b26380380610b2683398101604081905261002f9161011b565b600180546001600160a01b0319166001600160a01b03861617905560025461271010156100a35760405162461bcd60e51b815260206004820152601360248201527f6270732065786365656473204d41585f4250530000000000000000000000000060448201526064015b60405180910390fd5b600283905580821061010a5760405162461bcd60e51b815260206004820152602a60248201527f737461727454696d657374616d70206d757374206265206265666f726520656e60448201526906454696d657374616d760b41b606482015260840161009a565b600391909155600455506101669050565b6000806000806080858703121561013157600080fd5b84516001600160a01b038116811461014857600080fd5b60208601516040870151606090970151919890975090945092505050565b6109b1806101756000396000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c80637df6a6c811610097578063c44bef7511610066578063c44bef751461022b578063d547741f1461023e578063e6fd48bc14610251578063fd967f471461025a57600080fd5b80637df6a6c8146101f457806391d1485414610207578063a217fddf1461021a578063a85adeab1461022257600080fd5b806336568abe116100d357806336568abe146101b2578063400ba069146101c557806368237329146101d85780637d82b35b146101e157600080fd5b806301ffc9a71461010557806315dae03e1461012d578063248a9ca31461016c5780632f2ff15d1461019d575b600080fd5b6101186101133660046107db565b610263565b60405190151581526020015b60405180910390f35b604080518082018252601e81527f54494d454652414d455f50455243454e544147455f4645455f53484152450000602082015290516101249190610805565b61018f61017a366004610853565b60009081526020819052604090206001015490565b604051908152602001610124565b6101b06101ab366004610888565b61029a565b005b6101b06101c0366004610888565b6102c5565b61018f6101d3366004610888565b6102fd565b61018f60025481565b6101b06101ef366004610853565b610333565b6101b0610202366004610853565b610418565b610118610215366004610888565b6104cd565b61018f600081565b61018f60045481565b6101b0610239366004610853565b6104f6565b6101b061024c366004610888565b6105ab565b61018f60035481565b61018f61271081565b60006001600160e01b03198216637965db0b60e01b148061029457506301ffc9a760e01b6001600160e01b03198316145b92915050565b6000828152602081905260409020600101546102b5816105d0565b6102bf83836105dd565b50505050565b6001600160a01b03811633146102ee5760405163334bd91960e11b815260040160405180910390fd5b6102f8828261066f565b505050565b6000600354421080610310575060045442115b1561031d57506000610294565b61032c836002546127106106da565b9392505050565b600154604051632474521560e21b8152600060048201523360248201526001600160a01b03909116906391d1485490604401602060405180830381865afa158015610382573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103a691906108b4565b6103cb5760405162461bcd60e51b81526004016103c2906108d6565b60405180910390fd5b6127108111156104135760405162461bcd60e51b81526020600482015260136024820152726270732065786365656473204d41585f42505360681b60448201526064016103c2565b600255565b600154604051632474521560e21b8152600060048201523360248201526001600160a01b03909116906391d1485490604401602060405180830381865afa158015610467573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061048b91906108b4565b6104a75760405162461bcd60e51b81526004016103c2906108d6565b80600354106104c85760405162461bcd60e51b81526004016103c29061091b565b600455565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b600154604051632474521560e21b8152600060048201523360248201526001600160a01b03909116906391d1485490604401602060405180830381865afa158015610545573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061056991906108b4565b6105855760405162461bcd60e51b81526004016103c2906108d6565b60045481106105a65760405162461bcd60e51b81526004016103c29061091b565b600355565b6000828152602081905260409020600101546105c6816105d0565b6102bf838361066f565b6105da813361079e565b50565b60006105e983836104cd565b610667576000838152602081815260408083206001600160a01b03861684529091529020805460ff1916600117905561061f3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a4506001610294565b506000610294565b600061067b83836104cd565b15610667576000838152602081815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a4506001610294565b60008383028160001985870982811083820303915050806000036107115783828161070757610707610965565b049250505061032c565b8084116107315760405163227bc15360e01b815260040160405180910390fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b6107a882826104cd565b6107d75760405163e2517d3f60e01b81526001600160a01b0382166004820152602481018390526044016103c2565b5050565b6000602082840312156107ed57600080fd5b81356001600160e01b03198116811461032c57600080fd5b600060208083528351808285015260005b8181101561083257858101830151858201604001528201610816565b506000604082860101526040601f19601f8301168501019250505092915050565b60006020828403121561086557600080fd5b5035919050565b80356001600160a01b038116811461088357600080fd5b919050565b6000806040838503121561089b57600080fd5b823591506108ab6020840161086c565b90509250929050565b6000602082840312156108c657600080fd5b8151801515811461032c57600080fd5b60208082526025908201527f4f6e6c792073686f702064656661756c742061646d696e2063616e2063616c6c604082015264207468697360d81b606082015260800190565b6020808252602a908201527f737461727454696d657374616d70206d757374206265206265666f726520656e60408201526906454696d657374616d760b41b606082015260800190565b634e487b7160e01b600052601260045260246000fdfea2646970667358221220f2c02e83d5c77649fd30c14afb9d8bad84ed9b6b81a59d9fe3d0d1579ee3bb5564736f6c63430008140033";
