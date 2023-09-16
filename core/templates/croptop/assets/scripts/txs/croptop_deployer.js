const croptopDeployerContract = (chainId) => {
  switch (chainId) {
    case 5:
      return "0x0D45B6f63FE778e52b58F0120E3477d5D48c6AD4";
  }
}

const ethPaymentTerminalContract = (chainId) => {
  switch (chainId) {
    case 1:
      return "0x97a5b9D9F0F7cD676B69f584F29048D0Ef4BB59b";
    case 5:
      return "0x0baCb87Cf7DbDdde2299D92673A938E067a9eb29";
  }
}

const croptopDeployerContractABI = [{
  "inputs": [
    {
      "internalType": "contract IJBController3_1",
      "name": "_controller",
      "type": "address"
    },
    {
      "internalType": "contract IJBTiered721DelegateProjectDeployer",
      "name": "_deployer",
      "type": "address"
    },
    {
      "internalType": "contract IJBTiered721DelegateStore",
      "name": "_store",
      "type": "address"
    },
    {
      "internalType": "contract CroptopPublisher",
      "name": "_publisher",
      "type": "address"
    }
  ],
  "stateMutability": "nonpayable",
  "type": "constructor"
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
  "inputs": [
    {
      "internalType": "address",
      "name": "_owner",
      "type": "address"
    },
    {
      "internalType": "contract IJBPaymentTerminal",
      "name": "_terminal",
      "type": "address"
    },
    {
      "components": [
        {
          "internalType": "string",
          "name": "content",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "domain",
          "type": "uint256"
        }
      ],
      "internalType": "struct JBProjectMetadata",
      "name": "_projectMetadata",
      "type": "tuple"
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
    },
    {
      "internalType": "string",
      "name": "_contractUri",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_name",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_symbol",
      "type": "string"
    }
  ],
  "name": "deployProjectFor",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "projectId",
      "type": "uint256"
    }
  ],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [],
  "name": "deployer",
  "outputs": [
    {
      "internalType": "contract IJBTiered721DelegateProjectDeployer",
      "name": "",
      "type": "address"
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
      "name": "_from",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "_tokenId",
      "type": "uint256"
    },
    {
      "internalType": "bytes",
      "name": "_data",
      "type": "bytes"
    }
  ],
  "name": "onERC721Received",
  "outputs": [
    {
      "internalType": "bytes4",
      "name": "",
      "type": "bytes4"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "publisher",
  "outputs": [
    {
      "internalType": "contract CroptopPublisher",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "store",
  "outputs": [
    {
      "internalType": "contract IJBTiered721DelegateStore",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}];

const tx_deploy_project = async (name, symbol, owner, minimumPrice, minimumTotalSupply, maximumTotalSupply, allowedAddresses, chainId) => {
  const contract = croptopDeployerContract(chainId);
  if (!contract) return false;
  const terminal = ethPaymentTerminalContract(chainId);
  const projectMetadata = {  domain: 0, content: "QmaJzQjaFKxU2LLyqPTpZoGU47owQcmmvVCP1p4YqeuMUy" };
  const contractUri = "";
  const allowedPost = { nft: "0x0000000000000000000000000000000000000000", category: 0, minimumPrice, minimumTotalSupply, maximumTotalSupply, allowedAddresses};
  await sign(contract, croptopDeployerContractABI, "deployProjectFor", [owner, terminal, projectMetadata, [allowedPost], contractUri, name, symbol]);
  return true;
}
