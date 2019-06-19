import Vue from "vue";
import App from "./App.vue";
import "normalize.css";
import "./assets/css/default.css";
import "./assets/css/typography.css";
import store from "./store";

Vue.config.productionTip = false;

new Vue({
  store: store,
  render: h => h(App)
}).$mount("#app");
