import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RootView from "../views/RootView.vue";
import CreatePlanetView from "../views/CreatePlanetView.vue";
import FollowPlanetView from "../views/FollowPlanetView.vue";
import ArticlesView from "../views/ArticlesView.vue";
import LoadingView from "../views/LoadingView.vue";
import TopbarView from "../views/TopbarView.vue";
import AudioPlayerView from "../views/AudioPlayerView.vue";
import ArticleEditorTopbarView from "../views/ArticleEditorTopbarView.vue";
import ArticleEditorView from "../views/ArticleEditorView.vue";
import ArticleEditorWaiting from "../views/ArticleEditorWaiting.vue";
import PlanetInfoView from "../views/PlanetInfoView.vue";
import EmptyView from "../views/EmptyView.vue";
import CreateWalletView from "../views/CreateWalletView.vue";
import UnlockWalletView from "../views/UnlockWalletView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/root",
      name: "root",
      component: RootView,
    },
    {
      path: "/articles",
      component: ArticlesView,
    },
    {
      path: "/loading",
      component: LoadingView,
    },
    {
      path: "/empty",
      component: EmptyView,
    },
    {
      path: "/topbar",
      component: TopbarView,
    },
    {
      path: "/player",
      component: AudioPlayerView,
    },
    {
      path: "/editor/topbar",
      component: ArticleEditorTopbarView,
    },
    {
      path: "/editor/main",
      component: ArticleEditorView,
    },
    {
      path: "/editor/waiting",
      component: ArticleEditorWaiting,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/wallet/create",
      component: CreateWalletView,
    },
    {
      path: "/wallet/unlock",
      component: UnlockWalletView,
    },
    {
      path: "/dialog/planet/create",
      component: CreatePlanetView,
    },
    {
      path: "/dialog/planet/follow",
      component: FollowPlanetView,
    },
    {
      path: "/dialog/planet/info",
      component: PlanetInfoView,
    },
  ],
});
export default router;
