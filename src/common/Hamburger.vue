<template>
  <div class="hamburger" :style="{ background: bg }">
    <img
      svg-inline
      @click="$emit('toggle')"
      src="../assets/hamburger.svg"
      alt
      draggable="false"
    />
  </div>
</template>

<style lang="scss" scoped>
.hamburger {
  user-select: none;
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 3;
  background: white;
  padding: 1em 0;
  display: none;

  svg {
    cursor: pointer;
  }

  svg:hover {
    opacity: $hover-opacity;
  }
}

@media only screen and (max-width: 600px) {
  .hamburger {
    display: block;
  }
}
</style>

<script>
export default {
  props: { bg: String }
};
</script>
