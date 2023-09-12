import { createRouter, createWebHashHistory } from "vue-router";

import Home from "./screen/Home.vue";
import About from "./screen/About.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
