<template>
  <img ref="img" @error="handleError($event)" :src="computedSrc" alt draggable="false" />
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
    handleError() {
      if (this.makeNull) return;
      this.makeNull = true;
      setTimeout(() => {
        this.makeNull = false;
      }, 5000);
    }
  }
};
</script>
