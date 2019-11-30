export default {
  install(Vue) {
    if (Vue.prototype.$extensions == null) Vue.prototype.$extensions = {};

    Vue.prototype.$extensions.confirmDialog = new Vue({
      data() {
        return {
          open: false,
          title: '',
          body: '',
          buttonText: '',
          buttonColor: '',
          confirmFn: null,
        }
      },
      methods: {
        showConfirm(title, body, buttonText, buttonColor, confirmFn) {
          this.title = title;
          this.body = body;
          this.buttonText = buttonText;
          this.buttonColor = buttonColor;
          this.confirmFn = confirmFn;
          this.open = true;
        },
        runConfirm() {
          if (this.confirmFn != null) {
            this.confirmFn();
          }
          this.hideConfirm();
        },
        hideConfirm() {
          this.confirmFn = null;
          this.open = false;
        }
      }
    });

    // Shorter alias
    Vue.prototype.$extensions.confirm = Vue.prototype.$extensions.confirmDialog.showConfirm;
  },
};
