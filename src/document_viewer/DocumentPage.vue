<template>
  <div class="pagecontainer">
    <div
      class="page"
      :style="{
        maxWidth: `${zoomLevel}px`,
        padding: `20px ${horizontalPadding}px`
      }"
    >
      <div class="imagepage">
        <img draggable="false" v-if="imageMode" :src="page.image" alt />
        <RedactDrag
          v-if="imageMode && $editing.redactMode"
          :page="page.number - 1"
        />
      </div>
      <div class="text" v-if="textMode">
        <div class="chars">{{ page.text }}</div>
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

.imagepage {
  width: 100%;
  height: 100%;
  position: relative;
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

img {
  user-select: none;
}
</style>

<script>
import RedactDrag from "./RedactDrag";

export default {
  components: { RedactDrag },
  props: {
    page: Object,
    zoomLevel: Number,
    mode: String,
    horizontalPadding: Number
  },
  computed: {
    imageMode() {
      console.log("MODE", this.mode);
      return this.mode == "images";
    },
    textMode() {
      console.log("MODE", this.mode);
      return this.mode == "text";
    }
  }
};
</script>
