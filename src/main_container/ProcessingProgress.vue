<template>
  <div>
    <div class="bar" :class="{ initializing }">
      <div
        class="inner"
        :class="{ animate, fast: doc.linger }"
        :style="{ width: `${processingProgress * 100}%` }"
      ></div>
      <img
        svg-inline
        @click="cancelProcessing()"
        class="close"
        src="../assets/close.svg"
        alt
        draggable="false"
      />
    </div>
    <p class="status" :class="{ complete }">{{ progressMsg }}</p>
  </div>
</template>

<style lang="scss" scoped>
$progressWidth: 320px;
$closePadding: 5px;

.inner {
  width: 23%;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: $primary;
  background: repeating-linear-gradient(
    57deg,
    rgba($primary, 0.8),
    rgba($primary, 0.8) 20px,
    $primary 20px,
    $primary 40px /* determines size */
  );
  background-size: 48px 48px;
  animation: slide 1s infinite linear forwards;
  border-radius: $radius;

  &.animate {
    transition: $progress-transition;
  }

  &.fast {
    transition: width 0.5s linear;
  }
}

.bar {
  height: 18px;
  border-radius: $radius;
  width: $progressWidth;
  background: $barFaded;
  position: relative;
  margin-top: 1em;

  &.initializing {
    background: repeating-linear-gradient(
      57deg,
      darken($barFaded, 10%),
      darken($barFaded, 10%) 20px,
      $barFaded 20px,
      $barFaded 40px /* determines size */
    );
    background-size: 48px 48px;
    animation: slide 1s infinite linear forwards;
  }

  .close {
    margin: 0 $closePadding 0 ($progressWidth + $closePadding);
    cursor: pointer;
    user-select: none;
  }

  .close:hover {
    opacity: $hover-opacity;
  }
}

@keyframes slide {
  0% {
    background-position: 48px 0;
  }
  100% {
    background-position: 0 0;
  }
}

.status {
  color: $gray;
  font-size: 14px;
  margin: 0.5em 0;

  &.complete {
    color: green;
  }
}
</style>

<script>
import { tween } from "@/tween.js";

const RATE = 0.01;
const INSTANT_PROGRESS = 0.05;

export default {
  data() {
    return {
      imagesProcessed: 0,
      textsProcessed: 0,
      animate: false
    };
  },
  props: {
    doc: Object
  },
  watch: {
    "doc.imagesProcessed": function(newValue) {
      if (this.animate) {
        tween(this.$data, RATE, "imagesProcessed", newValue);
      } else {
        this.imagesProcessed = newValue;
      }
    },
    "doc.textsProcessed": function(newValue) {
      if (this.animate) {
        tween(this.$data, RATE, "textsProcessed", newValue);
      } else {
        this.textsProcessed = newValue;
      }
    }
  },
  mounted() {
    setTimeout(() => (this.animate = true), 1200);
  },
  computed: {
    pageCount() {
      return this.doc.pageCount;
    },
    processingProgress() {
      if (this.pageCount == 0) return 0;
      if (this.doc.successPreLinger) {
        return 1;
      }
      return (
        INSTANT_PROGRESS +
        ((this.imagesProcessed + this.textsProcessed) / (this.pageCount * 2)) *
          (1 - INSTANT_PROGRESS)
      );
    },
    initializing() {
      return this.processingProgress == 0;
    },
    complete() {
      return this.doc.processingProgress == 1;
    },
    progressMsg() {
      if (this.doc.pageCount == 0) {
        return "Extracting document information";
      }

      // Come up with a message
      const parts = [];
      if (this.imagesProcessed < this.pageCount) {
        parts.push(
          `processing images (${Math.round(this.imagesProcessed)}/${
            this.pageCount
          })`
        );
      } else {
        parts.push(`processed all images (${this.pageCount})`);
      }
      if (this.textsProcessed < this.pageCount) {
        parts.push(
          `processing text (${Math.round(this.textsProcessed)}/${
            this.pageCount
          })`
        );
      } else {
        parts.push(`processed all texts (${this.pageCount})`);
      }

      if (parts.length == 0) {
        return "Done processing";
      }

      const result = parts.join(", ");
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
  },
  methods: {
    cancelProcessing() {
      // TODO: cancel processing
    }
  }
};
</script>
