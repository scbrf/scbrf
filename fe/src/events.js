import { useIPFSStore } from "./stores/ipfs";
import { useArticlesStore } from "./stores/articles";
import { useTopbarStore } from "./stores/topbar";
import { useEditorStore } from "./stores/editor";
import { usePlanetInfoStore } from "./stores/planetinfo";
import { useEditPlanetStore } from "./stores/editplanet";

export default function () {
  const ipfs = useIPFSStore();
  const articles = useArticlesStore();
  const topbar = useTopbarStore();
  const editor = useEditorStore();
  const planetinfo = usePlanetInfoStore();
  const planetEditor = useEditPlanetStore();

  api.recieve("ipfsOnlineState", (p) => {
    for (let key of Object.keys(p[0])) {
      ipfs[key] = p[0][key];
    }
    // ipfs.$patch(p[0]); //seems has bug do not want to deep into
  });
  api.recieve("myplanets", (p) => {
    ipfs.planets = p[0];
  });
  api.recieve("following", (p) => {
    ipfs.following = p[0];
  });
  api.recieve("numbers", (p) => {
    ipfs.numbers = p[0];
  });
  api.recieve("articles", (p) => {
    for (let key of Object.keys(p[0])) {
      articles[key] = p[0][key];
    }
  });
  api.recieve("topbar", (p) => {
    for (let key of Object.keys(p[0])) {
      topbar[key] = p[0][key];
    }
  });
  api.recieve("updateVideo", (p) => {
    editor.videoFilename = p[0];
  });
  api.recieve("updateAudio", (p) => {
    editor.audioFilename = p[0];
  });
  api.recieve("updateAttachments", (p) => {
    editor.attachments = p[0];
  });
  api.recieve("editor/update", (p) => {
    for (let key of Object.keys(p[0])) {
      editor[key] = p[0][key];
    }
  });
  api.recieve("planetInfo", (p) => {
    for (let key of Object.keys(p[0])) {
      planetinfo[key] = p[0][key];
    }
  });
  api.recieve("create-edit-planet", (p) => {
    for (let key of Object.keys(p[0])) {
      planetEditor[key] = p[0][key];
    }
  });
}
