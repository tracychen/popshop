export const abi = [
  {
    type: "constructor",
    inputs: [
      { name: "shopAddress", type: "address", internalType: "address" },
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
    name: "addToAllowlist",
    inputs: [
      {
        name: "addresses",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
      { name: "recipient", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllowlist",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllowlistLength",
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
    name: "isAllowlisted",
    inputs: [{ name: "buyer", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeFromAllowlist",
    inputs: [
      {
        name: "addresses",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
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
  "0x608060405234801561001057600080fd5b50604051610ec3380380610ec383398101604081905261002f91610058565b600180546001600160a01b0319166001600160a01b039390931692909217909155600255610092565b6000806040838503121561006b57600080fd5b82516001600160a01b038116811461008257600080fd5b6020939093015192949293505050565b610e22806100a16000396000f3fe608060405234801561001057600080fd5b506004361061010b5760003560e01c80635207c273116100a257806391d148541161007157806391d1485414610240578063a217fddf14610253578063c5eff3d01461025b578063d547741f14610270578063fd967f471461028357600080fd5b80635207c2731461020957806364d042f01461021c57806368237329146102245780637d82b35b1461022d57600080fd5b8063248a9ca3116100de578063248a9ca31461019f5780632f2ff15d146101d057806336568abe146101e3578063400ba069146101f657600080fd5b806301ffc9a71461011057806305a3b80914610138578063104b6cb71461014b57806315dae03e14610160575b600080fd5b61012361011e366004610ae5565b61028c565b60405190151581526020015b60405180910390f35b610123610146366004610b2b565b6102c3565b61015e610159366004610b5c565b6102d0565b005b604080518082018252601e81527f414c4c4f574c4953545f50455243454e544147455f4645455f534841524500006020820152905161012f9190610c21565b6101c26101ad366004610c6f565b60009081526020819052604090206001015490565b60405190815260200161012f565b61015e6101de366004610c88565b6103b8565b61015e6101f1366004610c88565b6103e3565b6101c2610204366004610c88565b61041b565b61015e610217366004610b5c565b61044c565b6101c2610527565b6101c260025481565b61015e61023b366004610c6f565b610538565b61012361024e366004610c88565b610614565b6101c2600081565b61026361063d565b60405161012f9190610cb4565b61015e61027e366004610c88565b6106f0565b6101c261271081565b60006001600160e01b03198216637965db0b60e01b14806102bd57506301ffc9a760e01b6001600160e01b03198316145b92915050565b60006102bd600383610715565b600154604051632474521560e21b8152600060048201523360248201526001600160a01b03909116906391d1485490604401602060405180830381865afa15801561031f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103439190610d01565b6103685760405162461bcd60e51b815260040161035f90610d23565b60405180910390fd5b60005b81518110156103b4576103a182828151811061038957610389610d68565b6020026020010151600361073a90919063ffffffff16565b50806103ac81610d94565b91505061036b565b5050565b6000828152602081905260409020600101546103d38161074f565b6103dd838361075c565b50505050565b6001600160a01b038116331461040c5760405163334bd91960e11b815260040160405180910390fd5b61041682826107ee565b505050565b6000610428600383610715565b156104435761043c83600254612710610859565b90506102bd565b50600092915050565b600154604051632474521560e21b8152600060048201523360248201526001600160a01b03909116906391d1485490604401602060405180830381865afa15801561049b573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104bf9190610d01565b6104db5760405162461bcd60e51b815260040161035f90610d23565b60005b81518110156103b4576105148282815181106104fc576104fc610d68565b6020026020010151600361091d90919063ffffffff16565b508061051f81610d94565b9150506104de565b60006105336003610932565b905090565b600154604051632474521560e21b8152600060048201523360248201526001600160a01b03909116906391d1485490604401602060405180830381865afa158015610587573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105ab9190610d01565b6105c75760405162461bcd60e51b815260040161035f90610d23565b61271081111561060f5760405162461bcd60e51b81526020600482015260136024820152726270732065786365656473204d41585f42505360681b604482015260640161035f565b600255565b6000918252602082815260408084206001600160a01b0393909316845291905290205460ff1690565b6060600061064b6003610932565b67ffffffffffffffff81111561066357610663610b46565b60405190808252806020026020018201604052801561068c578160200160208202803683370190505b50905060005b61069c6003610932565b8110156106ea576106ae60038261093c565b8282815181106106c0576106c0610d68565b6001600160a01b0390921660209283029190910190910152806106e281610d94565b915050610692565b50919050565b60008281526020819052604090206001015461070b8161074f565b6103dd83836107ee565b6001600160a01b038116600090815260018301602052604081205415155b9392505050565b6000610733836001600160a01b038416610948565b6107598133610a3b565b50565b60006107688383610614565b6107e6576000838152602081815260408083206001600160a01b03861684529091529020805460ff1916600117905561079e3390565b6001600160a01b0316826001600160a01b0316847f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45060016102bd565b5060006102bd565b60006107fa8383610614565b156107e6576000838152602081815260408083206001600160a01b0386168085529252808320805460ff1916905551339286917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45060016102bd565b60008383028160001985870982811083820303915050806000036108905783828161088657610886610dad565b0492505050610733565b8084116108b05760405163227bc15360e01b815260040160405180910390fd5b6000848688096000868103871696879004966002600389028118808a02820302808a02820302808a02820302808a02820302808a02820302808a02909103029181900381900460010186841190950394909402919094039290920491909117919091029150509392505050565b6000610733836001600160a01b038416610a74565b60006102bd825490565b60006107338383610abb565b60008181526001830160205260408120548015610a3157600061096c600183610dc3565b855490915060009061098090600190610dc3565b90508082146109e55760008660000182815481106109a0576109a0610d68565b90600052602060002001549050808760000184815481106109c3576109c3610d68565b6000918252602080832090910192909255918252600188019052604090208390555b85548690806109f6576109f6610dd6565b6001900381819060005260206000200160009055905585600101600086815260200190815260200160002060009055600193505050506102bd565b60009150506102bd565b610a458282610614565b6103b45760405163e2517d3f60e01b81526001600160a01b03821660048201526024810183905260440161035f565b60008181526001830160205260408120546107e6575081546001818101845560008481526020808220909301849055845484825282860190935260409020919091556102bd565b6000826000018281548110610ad257610ad2610d68565b9060005260206000200154905092915050565b600060208284031215610af757600080fd5b81356001600160e01b03198116811461073357600080fd5b80356001600160a01b0381168114610b2657600080fd5b919050565b600060208284031215610b3d57600080fd5b61073382610b0f565b634e487b7160e01b600052604160045260246000fd5b60006020808385031215610b6f57600080fd5b823567ffffffffffffffff80821115610b8757600080fd5b818501915085601f830112610b9b57600080fd5b813581811115610bad57610bad610b46565b8060051b604051601f19603f83011681018181108582111715610bd257610bd2610b46565b604052918252848201925083810185019188831115610bf057600080fd5b938501935b82851015610c1557610c0685610b0f565b84529385019392850192610bf5565b98975050505050505050565b600060208083528351808285015260005b81811015610c4e57858101830151858201604001528201610c32565b506000604082860101526040601f19601f8301168501019250505092915050565b600060208284031215610c8157600080fd5b5035919050565b60008060408385031215610c9b57600080fd5b82359150610cab60208401610b0f565b90509250929050565b6020808252825182820181905260009190848201906040850190845b81811015610cf55783516001600160a01b031683529284019291840191600101610cd0565b50909695505050505050565b600060208284031215610d1357600080fd5b8151801515811461073357600080fd5b60208082526025908201527f4f6e6c792073686f702064656661756c742061646d696e2063616e2063616c6c604082015264207468697360d81b606082015260800190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060018201610da657610da6610d7e565b5060010190565b634e487b7160e01b600052601260045260246000fd5b818103818111156102bd576102bd610d7e565b634e487b7160e01b600052603160045260246000fdfea264697066735822122035dd355b20a98e7e8e0ef2980975751ec33e0077fc14227bbfd723790835d94b64736f6c63430008140033";