import { defineStore } from "pinia";

export const useFairStore = defineStore("fair", {
  state: () => ({
    title: "",
    planet: "",
    gas: "",
    balance: "",
    address: "",
    durationLimit: 0,
    error: "",
  }),
});
