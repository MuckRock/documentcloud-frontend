<template>
  <div>
    <div class="shim" @click="dismiss()"></div>
    <div class="modalcontainer">
      <div class="modalintermediate">
        <div ref="modal" class="modal">
          <div class="header">
            <img
              svg-inline
              v-if="dismissable"
              @click="dismiss()"
              class="close"
              src="../assets/close.svg"
              alt
              draggable="false"
            />
          </div>
          <component
            :is="component"
            v-bind="properties"
            @setDismissable="setDismissable($event)"
            v-on="$listeners"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shim {
  background: #051d38b5;
  z-index: 20;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.modalcontainer {
  z-index: 21;
  position: fixed;
  top: 10vh;
  left: 20vw;
  height: 80vh;
  width: 60vw;
  display: table;
  pointer-events: none;
  -webkit-overflow-scrolling: touch;
}

.modalintermediate {
  display: table-cell;
  vertical-align: middle;
  pointer-events: none;
  -webkit-overflow-scrolling: touch;
}

.modal {
  box-sizing: border-box;
  overflow-y: auto;
  background: white;
  border-radius: $radius;
  color: black;
  padding: 0;
  box-shadow: $overlay-shadow;
  position: relative;
  max-height: 100%;
  max-width: 766px;
  margin: 0 auto;
  text-align: left;
  pointer-events: all;
  -webkit-overflow-scrolling: touch;
}

@media only screen and (max-width: 600px) {
  .modalcontainer {
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
  }
}

.header {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  height: $modal-vert-padding;
  margin-bottom: 2px;
  z-index: 29;
}

.close {
  user-select: none;
  margin-left: 12px;
  margin-top: 12px;
}

.close:hover {
  opacity: $hover-opacity;
  cursor: pointer;
}

.modal ::v-deep h1 {
  font-size: 18px;
  font-weight: 600;
}

.modal ::v-deep .mcontent {
  padding: 0 $modal-horiz-padding;
}
</style>

<script>
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

export default {
  data() {
    return {
      dismissable: true
    };
  },
  props: {
    component: Object,
    properties: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    dismiss() {
      if (this.dismissable) {
        this.$emit("close");
      }
    },
    setDismissable(dismissable) {
      this.dismissable = dismissable;
    }
  },
  mounted() {
    disableBodyScroll(this.$refs.modal);
  },
  beforeDestroy() {
    enableBodyScroll(this.$refs.modal);
  }
};
</script>
