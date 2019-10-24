export default {
  install(Vue) {
    if (Vue.API == null) Vue.API = {};

    Vue.API.apiUrl = process.env.VUE_APP_DC_BASE + process.env.VUE_APP_API;
    Vue.API.url = (x) => `${Vue.API.apiUrl}${x}`;
  }
}
