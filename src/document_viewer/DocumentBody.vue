<template>
  <div class="documentbody" ref="body">
    <DocumentPage
      v-for="page in pages"
      :key="page.number"
      :page="page"
      :zoomLevel="zoomLevel"
      :mode="mode"
      :horizontalPadding="pageHorizontalPadding"
    />
  </div>
</template>

<script>
import DocumentPage from "./DocumentPage";

const PAGE_SCROLL_PREVIEW = 150;
const PAGE_HORIZ_PADDING = 74;
const MIN_WIDTH = 300;
const ZOOM_AMOUNT = 100;

function bound(value, min, max) {
  if (value < min) value = min;
  if (value > max) value = max;
  return value;
}

export default {
  components: { DocumentPage },
  props: {
    pages: Array,
    currentPage: Number,
    zoomLevel: Number,
    mode: String
  },
  data() {
    return {
      pageHorizontalPadding: 74
    };
  },
  methods: {
    handleScroll() {
      const offset =
        window.scrollY + this.$refs.body.offsetTop + PAGE_SCROLL_PREVIEW;
      let page = 1;
      for (page = 1; page < this.$refs.body.children.length; page++) {
        if (this.$refs.body.children[page].offsetTop > offset) break;
      }
      this.$emit("update:currentPage", page);
    },
    jump(pageNumber) {
      window.scrollTo(
        0,
        this.$refs.body.children[pageNumber - 1].offsetTop -
          this.$refs.body.offsetTop
      );
    },
    zoom(direction) {
      const maxLevel = this.$refs.body.offsetWidth - PAGE_HORIZ_PADDING * 2;
      const minLevel = PAGE_HORIZ_PADDING * 2 + MIN_WIDTH;

      if (direction == 1) {
        // Zoom in
        this.updateZoom(
          bound(this.zoomLevel + ZOOM_AMOUNT, minLevel, maxLevel)
        );
      } else {
        // Zoom out
        this.updateZoom(
          bound(this.zoomLevel - ZOOM_AMOUNT, minLevel, maxLevel)
        );
      }
    },
    updateZoom(level) {
      // TODO: restore current page
      this.$emit("update:zoomLevel", level);
    }
  },
  created() {
    window.addEventListener("scroll", this.handleScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.handleScroll);
  }
};
</script>

<style scoped>
.documentbody {
  background: var(--document-body-bg);
}
</style>