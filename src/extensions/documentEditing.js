export default {
  install(Vue, router) {
    if (Vue.prototype.$editing == null) Vue.prototype.$editing = {};

    Vue.prototype.$editing = new Vue({
      router,
      data() {
        return {
          editing: false,
          editMode: null,
          redactions: [],
          loading: false,
        }
      },
      watch: {
        $route() {
          this.exitEditing();
        }
      },
      computed: {
        redactionsUndoable() {
          return this.redactions.length > 0;
        },
        redactMode() {
          return this.editMode == 'redact';
        }
      },
      methods: {
        undoRedact() {
          this.redactions.pop();
        },
        enterRedactMode() {
          this.editing = true;
          this.editMode = "redact";
          this.redactions = [];
        },
        exitEditing() {
          this.editing = false;
          this.editMode = null;
        },
        async redact(id) {
          if (this.redactions.length > 0) {
            await Vue.API.redactDocument(this, id, this.redactions);
            this.redactions = [];
            // this.$router.push({ name: "app" });
            window.location.replace(`/app?now=${new Date()}`);
          }
        }
      }
    });
  },
};
