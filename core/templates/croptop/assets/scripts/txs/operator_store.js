const operatorStoreContract = (chainId) => {
  switch (chainId) {
    case 1:
      return "0x6F3C5afCa0c9eDf3926eF2dDF17c8ae6391afEfb";
    case 5:
      return "0x99dB6b517683237dE9C494bbd17861f3608F3585";
  }
}

const operatorStoreContractABI = [{
  "inputs": [],
  "name": "PERMISSION_INDEX_OUT_OF_BOUNDS",
  "type": "error"
},
{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "address",
      "name": "operator",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "account",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "uint256",
      "name": "domain",
      "type": "uint256"
    },
    {
      "indexed": false,
      "internalType": "uint256[]",
      "name": "permissionIndexes",
      "type": "uint256[]"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "packed",
      "type": "uint256"
    }
  ],
  "name": "SetOperator",
  "type": "event"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "_operator",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "_account",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_domain",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "_permissionIndex",
      "type": "uint256"
    }
  ],
  "name": "hasPermission",
  "outputs": [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "_operator",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "_account",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_domain",
      "type": "uint256"
    },
    {
      "internalType": "uint256[]",
      "name": "_permissionIndexes",
      "type": "uint256[]"
    }
  ],
  "name": "hasPermissions",
  "outputs": [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "name": "permissionsOf",
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
      "components": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "domain",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "permissionIndexes",
          "type": "uint256[]"
        }
      ],
      "internalType": "struct JBOperatorData",
      "name": "_operatorData",
      "type": "tuple"
    }
  ],
  "name": "setOperator",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "components": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "domain",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "permissionIndexes",
          "type": "uint256[]"
        }
      ],
      "internalType": "struct JBOperatorData[]",
      "name": "_operatorData",
      "type": "tuple[]"
    }
  ],
  "name": "setOperators",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}];

const tx_set_operator = async (projectId, chainId) => {
  const contract = operatorStoreContract(chainId);
  if (!contract) return false;
  const operator = croptopPublisherContract(chainId);
  const operatorData = { operator, domain: projectId, permissionIndexes: [21] };
  await sign(contract, operatorStoreContractABI, "setOperator", [operatorData]);
  return true;
}
