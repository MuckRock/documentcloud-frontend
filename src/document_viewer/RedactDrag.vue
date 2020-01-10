<template>
  <div
    class="overlay"
    ref="overlay"
    @mousedown="handleMouseDown($event)"
    @mousemove="handleMouseMove($event)"
    @mouseup="handleMouseUp($event)"
  >
    <div
      class="redaction"
      v-if="on"
      v-bind:style="{
        left: standardize(x1),
        top: standardize(y1),
        width: standardize(x2 - x1),
        height: standardize(y2 - y1)
      }"
    ></div>
    <div
      class="redaction"
      v-for="(redaction, i) in redactions"
      :key="i"
      v-bind:style="{
        left: standardize(redaction.x1),
        top: standardize(redaction.y1),
        width: standardize(redaction.x2 - redaction.x1),
        height: standardize(redaction.y2 - redaction.y1)
      }"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
.overlay {
  width: 100%;
  height: 100%;
  background: transparent;
  position: absolute;
  top: 0;
  cursor: crosshair;
}

.redaction {
  background: black;
  position: absolute;
  pointer-events: none;
}
</style>

<script>
export default {
  data() {
    return {
      redactStart: null,
      redactEnd: null
    };
  },
  props: {
    page: Number
  },
  computed: {
    on() {
      return this.redactStart != null && this.redactEnd != null;
    },
    x1() {
      if (!this.on) return null;
      return Math.min(this.redactStart.x, this.redactEnd.x);
    },
    x2() {
      if (!this.on) return null;
      return Math.max(this.redactStart.x, this.redactEnd.x);
    },
    y1() {
      if (!this.on) return null;
      return Math.min(this.redactStart.y, this.redactEnd.y);
    },
    y2() {
      if (!this.on) return null;
      return Math.max(this.redactStart.y, this.redactEnd.y);
    },
    redactions() {
      return this.$editing.redactions.filter(
        redaction => redaction.page == this.page
      );
    }
  },
  methods: {
    standardize(v) {
      return `${v * 100}%`;
    },
    convertToRedactCoordinates(x, y) {
      return {
        x: x / this.$refs.overlay.offsetWidth,
        y: y / this.$refs.overlay.offsetHeight
      };
    },
    convertToAbsoluteCoordinates(x, y) {
      return {
        x: x * this.$refs.overlay.offsetWidth,
        y: y * this.$refs.overlay.offsetHeight
      };
    },
    handleMouseDown(e) {
      this.redactStart = this.convertToRedactCoordinates(e.offsetX, e.offsetY);
    },
    handleMouseMove(e) {
      if (this.redactStart == null) return;
      this.redactEnd = this.convertToRedactCoordinates(e.offsetX, e.offsetY);
    },
    handleMouseUp() {
      if (this.on) {
        if (this.x1 != this.x2 && this.y1 != this.y2) {
          this.$editing.redactions.push({
            page: this.page,
            x1: this.x1,
            x2: this.x2,
            y1: this.y1,
            y2: this.y2
          });
        }
      }
      this.redactStart = null;
      this.redactEnd = null;
    }
  }
};
</script>
