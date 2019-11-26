<template>
  <div class="hamburger" @click="back()">
    <img svg-inline src="../assets/document_back.svg" alt />
  </div>
</template>

<script>
export default {
  methods: {
    back() {
      this.$router.push({ name: "app" });
    }
  }
};
</script>

<style lang="scss" scoped>
.hamburger {
  padding: 0 45px 0 26px;
  display: inline-block;
  vertical-align: middle;

  svg {
    cursor: pointer;

    &:hover {
      opacity: $hover-opacity;
    }
  }
}
</style>
