<template>
  <div>
    <div class="shim" @click="dismiss()"></div>
    <div @click="dismiss()" ref="menu" class="contextmenu" :style="{left: `${x}px`, top: `${y}px`}">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.shim {
  background: none;
  z-index: 10;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  cursor: default;
}

.contextmenu {
  position: fixed;
  background: #f7f7f7;
  border: 1px solid #cdcdcd;
  box-sizing: border-box;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  padding: 7px 0;
  z-index: 21;
}

.menuitem {
  padding: 3px 21px;
  cursor: pointer;
  font-size: 14px;
}

.menuitem:hover {
  background: var(--primary);
  color: white;
}
</style>

<script>
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

export default {
  props: {
    x: Number,
    y: Number
  },
  mounted() {
    disableBodyScroll(this.$refs.menu);
    window.addEventListener("resize", this.dismiss);
  },
  beforeDestroy() {
    enableBodyScroll(this.$refs.menu);
    window.removeEventListener("resize", this.dismiss);
  },
  methods: {
    dismiss() {
      this.$emit("close");
    }
  }
};
</script>