<template>
  <div class="pagecontainer">
    <div class="page" :style="{maxWidth: `${zoomLevel}px`, padding: `20px ${horizontalPadding}px`}">
      <img v-if="mode=='images'" :src="page.image" alt />
      <div class="text" v-if="mode=='texts'">
        <div class="chars">{{page.text}}</div>
      </div>
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

.page img {
  width: 100%;
  border: 1px solid #afafaf;
  box-sizing: border-box;
}

.text {
  border: 1px solid #afafaf;
  box-sizing: border-box;
  background: white;
  padding: 30px 16px;
  text-align: left;
  line-height: 1.4;
  white-space: pre-wrap;
}

.chars {
  max-width: 66ch;
  margin: 0 auto;
}
</style>

<script>
export default {
  props: {
    page: Object,
    zoomLevel: Number,
    mode: String,
    horizontalPadding: Number
  }
};
</script>