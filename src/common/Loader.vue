<template>
  <div :class="{loader: active, inline}">
    <div v-if="active" class="shim"></div>
    <div v-if="active" class="spinner"></div>
    <div class="contents">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.inline {
  display: inline-block;
}

.loader {
  pointer-events: none;
  position: relative;
  user-select: none;
}

.loader .contents {
  opacity: 0.1;
  transition: opacity 1s ease;
}

.shim {
  display: block;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
}

.loader .shim {
  display: block;
  pointer-events: inherit;
}

.spinner {
  /* display: none; */
  position: absolute;
  left: 8px;
  top: 8px;
  border: 4px solid transparent; /* Light grey */
  border-top: 4px solid var(--gray); /* Blue */
  border-bottom: 4px solid var(--gray); /* Blue */
  border-radius: 50%;
  box-sizing: border-radius;
  width: 10px;
  height: 10px;
  animation: spin 1.5s cubic-bezier(0.65, 0.175, 0.355, 0.835) infinite,
    opaquify 1s ease;
  z-index: 2;
  opacity: 0;
}

.loader .spinner {
  opacity: 1;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes opaquify {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>

<script>
export default {
  props: {
    active: Boolean,
    inline: {
      type: Boolean,
      default: false
    }
  }
};
</script>