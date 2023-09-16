const getProvider = (chainId) => {
  switch (chainId) {
    case 1: return new ethers.JsonRpcProvider(env.mainnetRPC || "https://rpc.ankr.com/eth");
    case 5: return new ethers.JsonRpcProvider(env.goerliRPC || "https://rpc.ankr.com/eth_goerli");
    default: return new ethers.BrowserProvider(window.ethereum);
  }
}

const getSigner = async (chainId) => {
  const provider = getProvider(chainId); 
  return await provider.getSigner();
}

const getChainId = async (chainId) => {
  const provider = getProvider(chainId); 
  let network = await provider.getNetwork();
  return parseInt(network.chainId);
}

const switchNetwork = async (id, chainId) => {
  const provider = getProvider(chainId); 
  return await provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: `0x${id.toString(16)}`}],
  });
}

const view = async (chainId, contractAddress, contractAbi, fn, params) => {
    const contract = new ethers.Contract(contractAddress, contractAbi, getProvider(chainId));
    return await contract[fn](...params);
}

const sign = async (contractAddress, contractAbi, fn, params) => {
    const contract = new ethers.Contract(contractAddress, contractAbi, await getSigner());
    return await contract[fn](...params);
}
