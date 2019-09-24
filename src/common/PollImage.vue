<template>
  <img ref="img" @error="handleError($event)" :src="computedSrc" alt />
</template>

<script>
export default {
  props: {
    src: String
  },
  data() {
    return {
      makeNull: false
    };
  },
  computed: {
    computedSrc() {
      if (this.makeNull) return "";
      return this.src;
    }
  },
  methods: {
    handleError(e) {
      if (this.makeNull) return;
      window.console.log("image error", e);
      this.makeNull = true;
      setTimeout(() => {
        this.makeNull = false;
      }, 500);
    }
  }
};
</script>