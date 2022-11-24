import { defineStore } from "pinia";

export const useOnlyfansStore = defineStore("onlyfans", {
  state: () => ({
    address: "",
    balance: "",
    gas: "",
    planet: "",
    error: "",
    price: "",
    pubkey: "",
  }),
});
