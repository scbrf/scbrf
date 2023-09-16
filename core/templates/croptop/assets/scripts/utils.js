const encodeIPFSUri = (cid) => { 
  try {
    const decodedCID = bs58.decode(cid);
    const slicedCID = decodedCID.slice(2);
    const uint8Array = new Uint8Array(slicedCID);
    let hex = '0x';
    for (let i = 0; i < uint8Array.length; i++) 
      hex += uint8Array[i].toString(16).padStart(2, '0');
    return hex;
  } catch (e) {
    return "0x0000000000000000000000000000000000000000000000000000000000000000"; 
  }
}

const encodeIPFSUriFrom = async (prefix, itemId) => {
  // Create the content's encoded IPFS URL.
  const cidUrl = `${prefix}${itemId}/nft.json.cid.txt`;
  const cid = await (await fetch(cidUrl)).text();
  return cid ? encodeIPFSUri(cid) : "0x0000000000000000000000000000000000000000000000000000000000000000";
}

const formatDate = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month}.${day}.${year.toString().slice(-2)}`;
}

const formatTimestamp = (timestamp) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const date = new Date((timestamp + 978307200) * 1000);
  return formatDate(date);
}

const formatPlayclock = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
} 

const resolveChainId = (value) => {
  switch (value) {
    case "mainnet": return 1; 
    case "goerli": return 5; 
  }
}

const resolveChainSelectIndex = (chain) => {
  switch (chain) {
    case "mainnet": return 0; 
    case "goerli": return 1; 
  }
}

const resolveChain = (chainId) => {
  switch (chainId) {
    case 1: return "mainnet"; 
    case 5: return "goerli"; 
  }
}

const cpnProjectId = (chain) => {
  switch (chain) {
    case "mainnet":
      return 1016;
    case "goerli":
      return 1016;
  }
}

const resolveCollectionId = (chain) => {
  switch (chain) {
    case "mainnet":
      return env.mainnetCollectionID || cpnProjectId(chain);
    case "goerli":
      return env.goerliCollectionID || cpnProjectId(chain);
  }
}

const resolveCollectionCategory = (chain) => {
  switch (chain) {
    case "mainnet":
      return env.mainnetCollectionCategory || 0;
    case "goerli":
      return env.goerliCollectionCategory || 0;
  }
}

const resolveCPNBeneficiaryAddress = (chain) => {
  switch (chain) {
    case "mainnet":
      return env.mainnetCPNBeneficiaryAddress;
    case "goerli":
      return env.goerliCPNBeneficiaryAddress;
  }
}

const projectLinkBase = (chain) => {
  switch (chain) {
    case "mainnet": 
      return "https://juicebox.money/v2/p/";
    case "goerli": 
      return "https://goerli.juicebox.money/v2/p/";
  }
}

const renderMarkdown = function(text) {
  const md = window.markdownit({
    html: true,
    xhtmlOut: false,
    linkify: true
  });
  md.use(window.markdownItAnchor, { permalink: true, permalinkBefore: false, permalinkSymbol: '#' })
  .use(window.markdownitTaskLists)
  .use(window.markdownitFootnote);
  return md.render(text);
}

const loadingAnimationPace = 100;
let animationIntervals = {};

/// Animate the loading ticker.
const startLoadingAnimation = (loadingAnimationId) => {
  const loadingAnimation = document.getElementById(loadingAnimationId);
  loadingAnimation.style.display = "initial";
  const loadingAnimationFrames = ['-', '\\', '|', '/'];
  let currentFrame = 0;

  const animate = (firstTime) => {
    loadingAnimation.textContent = loadingAnimationFrames[currentFrame];
    currentFrame = (currentFrame + 1) % loadingAnimationFrames.length;
    if (firstTime || animationIntervals[loadingAnimationId]) animationIntervals[loadingAnimationId] = setTimeout(() => animate(false), loadingAnimationPace);
  }

  animate(true);
}

/// Stop animating the loading ticker.
const stopLoadingAnimation = (loadingAnimationId) => {
  const loadingAnimation = document.getElementById(loadingAnimationId);
  animationIntervals[loadingAnimationId] = clearTimeout(animationIntervals[loadingAnimationId]);
  loadingAnimation.style.display = "none";
}

let audioAnimationInterval;
const audioAnimationFrames = ['▄', '▅', '█'];

const prepareAudioAnimation = (audioAnimationId) => {
  const audioAnimation = document.getElementById(audioAnimationId);
  audioAnimation.innerHTML = audioAnimationFrames[1] + audioAnimationFrames[2] + audioAnimationFrames[0];
}
const startAudioAnimation = (audioAnimationId) => {
  const audioAnimation = document.getElementById(audioAnimationId);
  const audioAnimationPace = 100;

  const animate = () => {
    const oneOrTwo = Math.floor(Math.random() * 2) + 1;
    const char0 = audioAnimationFrames[(audioAnimationFrames.indexOf(audioAnimation.innerHTML.charAt(0)) + oneOrTwo) % 3]; 
    const char1 = audioAnimationFrames[(audioAnimationFrames.indexOf(audioAnimation.innerHTML.charAt(1)) + oneOrTwo) % 3]; 
    const char2 = audioAnimationFrames[(audioAnimationFrames.indexOf(audioAnimation.innerHTML.charAt(2)) + oneOrTwo) % 3]; 
    audioAnimation.innerHTML = char0 + char1 + char2;
    animationIntervals[audioAnimationId] = setTimeout(animate, audioAnimationPace);
  }
  animate();
}

const stopAudioAnimation = (audioAnimationId) => {
  const audioAnimation = document.getElementById(audioAnimationId);
  animationIntervals[audioAnimationId] = clearTimeout(animationIntervals[audioAnimationId]);
}

