import { createI18n } from "vue-i18n/dist/vue-i18n.cjs";
const messages = {
  en: {
    message: {
      darkmode: "Dark",
      lightmode: "Light",
      hello: "hello world",
      about: {
        version: "Node: {node}, Chrome:{chrome}",
      },
    },
  },
  zh_CN: {
    message: {
      darkmode: "暗色模式",
      lightmode: "亮色模式",
      hello: "你好，世界",
      about: {
        version: "Node版本: {node}, Chrome:{chrome}",
      },
    },
  },
};

const language = navigator.language || navigator.userLanguage;
let locale = language.replace("-", "_");

const i18n = createI18n({
  legacy: false,
  locale, // set locale
  fallbackLocale: "en", // set fallback locale
  messages, // set locale messages
});
export default i18n;
