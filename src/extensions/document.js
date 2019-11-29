

export default {
  install(Vue, router) {
    if (Vue.prototype.$extensions == null) Vue.prototype.$extensions = {};

    Vue.prototype.$extensions.document = new Vue({
      router,
      methods: {
        open(doc) {
          this.$router.push({
            name: "viewer",
            params: {
              id: doc.slugId
            }
          });
        }
      }
    });
  },
};
