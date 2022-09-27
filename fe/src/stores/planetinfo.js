import { defineStore } from "pinia";

export const usePlanetInfoStore = defineStore("planetinfo", {
  state: () => ({
    about: "",
    updateat: 0,
    title: "",
    icon: "",
  }),
});
