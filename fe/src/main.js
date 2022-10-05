import { createApp } from "vue";
import { createPinia } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import App from "./App.vue";
import router from "./router";
import registerEvents from "./events";
import "./assets/main.css";

const app = createApp(App);
app.component(VueQrcode.name, VueQrcode);
app.use(createPinia());
registerEvents();
app.use(router);

app.mount("#app");
