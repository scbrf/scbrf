const croptopPublisherContract = (chainId) => {
  switch (chainId) {
    case 5:
      return "0xA0D761495dE03190cD8b72b939f5c1488c1C0a59";
  }
}

const croptopPublisherContractABI = [{
  "inputs": [
    {
      "internalType": "contract IJBController3_1",
      "name": "_controller",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_feeProjectId",
      "type": "uint256"
    }
  ],
  "stateMutability": "nonpayable",
  "type": "constructor"
},
{
  "inputs": [
    {
      "internalType": "bytes32",
      "name": "encodedUri",
      "type": "bytes32"
    }
  ],
  "name": "EMPTY_ENCODED_IPFS_URI",
  "type": "error"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "projectId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "dataSource",
      "type": "address"
    }
  ],
  "name": "INCOMPATIBLE_PROJECT",
  "type": "error"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "expected",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "sent",
      "type": "uint256"
    }
  ],
  "name": "INSUFFICIENT_ETH_SENT",
  "type": "error"
},
{
  "inputs": [],
  "name": "MAX_TOTAL_SUPPLY_LESS_THAN_MIN",
  "type": "error"
},
{
  "inputs": [
    {
      "internalType": "address[]",
      "name": "allowedAddresses",
      "type": "address[]"
    }
  ],
  "name": "NOT_IN_ALLOW_LIST",
  "type": "error"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "minimumPrice",
      "type": "uint256"
    }
  ],
  "name": "PRICE_TOO_SMALL",
  "type": "error"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "maximumTotalSupply",
      "type": "uint256"
    }
  ],
  "name": "TOTAL_SUPPLY_TOO_BIG",
  "type": "error"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "minimumTotalSupply",
      "type": "uint256"
    }
  ],
  "name": "TOTAL_SUPPLY_TOO_SMALL",
  "type": "error"
},
{
  "inputs": [],
  "name": "TOTAL_SUPPY_MUST_BE_POSITIVE",
  "type": "error"
},
{
  "inputs": [],
  "name": "UNAUTHORIZED",
  "type": "error"
},
{
  "inputs": [],
  "name": "UNAUTHORIZED_TO_POST_IN_CATEGORY",
  "type": "error"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "projectId",
      "type": "uint256"
    },
    {
      "components": [
        {
          "internalType": "bytes32",
          "name": "encodedIPFSUri",
          "type": "bytes32"
        },
        {
          "internalType": "uint32",
          "name": "totalSupply",
          "type": "uint32"
        },
        {
          "internalType": "uint88",
          "name": "price",
          "type": "uint88"
        },
        {
          "internalType": "uint16",
          "name": "category",
          "type": "uint16"
        }
      ],
      "indexed": false,
      "internalType": "struct Post[]",
      "name": "posts",
      "type": "tuple[]"
    },
    {
      "indexed": false,
      "internalType": "address",
      "name": "nftBeneficiary",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "address",
      "name": "feeBeneficiary",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "fee",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "address",
      "name": "caller",
      "type": "address"
    }
  ],
  "name": "Collected",
  "type": "event"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_projectId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_nft",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_category",
      "type": "uint256"
    }
  ],
  "name": "allowanceFor",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "minimumPrice",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "minimumTotalSupply",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "maximumTotalSupply",
      "type": "uint256"
    },
    {
      "internalType": "address[]",
      "name": "allowedAddresses",
      "type": "address[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_projectId",
      "type": "uint256"
    },
    {
      "components": [
        {
          "internalType": "bytes32",
          "name": "encodedIPFSUri",
          "type": "bytes32"
        },
        {
          "internalType": "uint32",
          "name": "totalSupply",
          "type": "uint32"
        },
        {
          "internalType": "uint88",
          "name": "price",
          "type": "uint88"
        },
        {
          "internalType": "uint16",
          "name": "category",
          "type": "uint16"
        }
      ],
      "internalType": "struct Post[]",
      "name": "_posts",
      "type": "tuple[]"
    },
    {
      "internalType": "address",
      "name": "_nftBeneficiary",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "_feeBeneficiary",
      "type": "address"
    },
    {
      "internalType": "bytes",
      "name": "_nftMetadata",
      "type": "bytes"
    },
    {
      "internalType": "bytes",
      "name": "_feeMetadata",
      "type": "bytes"
    }
  ],
  "name": "collectFrom",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_projectId",
      "type": "uint256"
    },
    {
      "components": [
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "category",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimumPrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimumTotalSupply",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maximumTotalSupply",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "allowedAddresses",
          "type": "address[]"
        }
      ],
      "internalType": "struct AllowedPost[]",
      "name": "_allowedPosts",
      "type": "tuple[]"
    }
  ],
  "name": "configureFor",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "controller",
  "outputs": [
    {
      "internalType": "contract IJBController3_1",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "feeDivisor",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "feeProjectId",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_projectId",
      "type": "uint256"
    },
    {
      "internalType": "bytes32",
      "name": "_encodedIPFSUri",
      "type": "bytes32"
    }
  ],
  "name": "tierIdForEncodedIPFSUriOf",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_projectId",
      "type": "uint256"
    },
    {
      "internalType": "address",
      "name": "_nft",
      "type": "address"
    },
    {
      "internalType": "bytes32[]",
      "name": "_encodedIPFSUris",
      "type": "bytes32[]"
    }
  ],
  "name": "tiersFor",
  "outputs": [
    {
      "components": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "remainingQuantity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "initialQuantity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "votingUnits",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "reservedRate",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "reservedTokenBeneficiary",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "encodedIPFSUri",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "category",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "allowManualMint",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "transfersPausable",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "resolvedUri",
          "type": "string"
        }
      ],
      "internalType": "struct JB721Tier[]",
      "name": "tiers",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}];

const tx_view_allowance = async (projectId, category, chainId) => {
  const contract = croptopPublisherContract(chainId);
  if (!contract) return [0, 0, 0];
  return await view(chainId, contract, croptopPublisherContractABI, "allowanceFor", [projectId, "0x0000000000000000000000000000000000000000", category]);
}

const tx_view_tiers = async (projectId, encodedIPFSUris, chainId) => {
  const contract = croptopPublisherContract(chainId);
  if (!contract) return [[0, 0, 0]];
  try {
    return await view(chainId, contract, croptopPublisherContractABI, "tiersFor", [projectId, "0x0000000000000000000000000000000000000000", encodedIPFSUris]);
  } catch (e) {
    console.log({  chainId, e });
    return [];  
  }
}

const tx_collect = async (projectId, category, totalSupply, price, quantity, encodedIPFSUri, beneficiary, cpnBeneficiary, value, chainId) => {
  const contract = croptopPublisherContract(chainId);
  if (!contract) return false;
  const post = {totalSupply, price, quantity, category, encodedIPFSUri};
  const posts = Array.from({length: quantity}, () => post);
  const emptyBytes = "0x";
  await sign(contract, croptopPublisherContractABI, "collectFrom", [projectId, posts, beneficiary, cpnBeneficiary, emptyBytes, emptyBytes, {
      value 
  }]);
  return true;
}

const tx_configure = async (projectId, category, minimumPrice, minimumTotalSupply, maximumTotalSupply, allowedAddresses, chainId) => {
  const contract = croptopPublisherContract(chainId);
  if (!contract) return false;
  const allowedPost = { nft: "0x0000000000000000000000000000000000000000", category, minimumPrice, minimumTotalSupply, maximumTotalSupply, allowedAddresses};
  await sign(contract, croptopPublisherContractABI, "configureFor", [projectId, [allowedPost]]);
  return true;
}
