import { defineStore } from "pinia";

export const useWalletStore = defineStore("wallet", {
  state: () => ({
    network: "",
    address: "",
    balance: "",
    events: [],
  }),
});
