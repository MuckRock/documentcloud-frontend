<template>
  <div class="pagecontainer">
    <div class="page" :style="{maxWidth: `${zoomLevel}px`, padding: `20px ${horizontalPadding}px`}">
      <img :src="page.image" alt />
    </div>
  </div>
</template>

<style scoped>
.page {
  text-align: center;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.page svg {
  width: 100%;
  border: 1px solid #afafaf;
  box-sizing: border-box;
}
</style>

<script>
export default {
  props: {
    page: Object,
    zoomLevel: Number,
    horizontalPadding: Number
  }
};
</script>