import { defineStore } from "pinia";

export const useEditPlanetStore = defineStore("editplanet", {
  state: () => ({
    id: "",
    name: "",
    about: "",
    template: "Plain",
  }),
});
