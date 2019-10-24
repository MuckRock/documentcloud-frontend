<template>
  <div>
    <div class="shim"></div>
    <DocumentHeader
      @jump="jump($event)"
      @zoom="handleZoom($event)"
      @mode="handleMode($event)"
      :currentPage="currentPage"
      :numPages="pages.length"
      :doc="doc"
      :mode="mode"
    />
    <DocumentBody
      ref="body"
      :currentPage.sync="currentPage"
      :pages="pages"
      :zoomLevel.sync="zoomLevel"
      :mode="mode"
    />
  </div>
</template>

<script>
import DocumentHeader from "./DocumentHeader";
import DocumentBody from "./DocumentBody";
import { pageSizesFromSpec } from "./pagesize.js";
import Vue from "vue";

const CLOUD_PREFIX = process.env.VUE_APP_STATIC_BASE;

export default {
  components: { DocumentHeader, DocumentBody },
  data() {
    return {
      pages: [],
      currentPage: 1,
      combined: null,
      slug: null,
      id: null,
      doc: null,
      zoomLevel: 1000,
      mode: "images"
    };
  },
  async mounted() {
    this.combined = this.$route.params.id;
    this.id = this.combined.split("-")[0];
    this.slug = this.combined.substr(this.id.length + 1);

    this.getPageSizes();
    this.getDoc();
  },
  methods: {
    jump(pageNumber) {
      this.$refs.body.jump(pageNumber);
    },
    handleZoom(direction) {
      this.$refs.body.zoom(direction);
    },
    handleMode(mode) {
      this.mode = mode;
    },
    async getPageSizes() {
      // Get page size information
      const pageSpecUrl = `${CLOUD_PREFIX}/documents/${this.id}/${this.slug}.pagesize`;
      const pageSpec = await (await fetch(pageSpecUrl)).text();
      const pageAspects = pageSizesFromSpec(pageSpec);

      this.pages = pageAspects.map((aspect, i) => ({
        number: i + 1,
        image: `${CLOUD_PREFIX}/documents/${this.id}/pages/${this.slug}-p${i +
          1}-large.gif`,
        aspect: aspect,
        textUrl: `${CLOUD_PREFIX}/documents/${this.id}/pages/${this.slug}-p${i +
          1}.txt`,
        text: null
      }));
      this.getPageTexts();
    },
    async getDoc() {
      // Get document information
      this.doc = await Vue.API.getDocument(null, this.id);
    },
    async getPageTexts() {
      for (let i = 0; i < this.pages.length; i++) {
        this.getPageText(i + 1);
      }
    },
    async getPageText(page) {
      this.pages[page - 1].text = await (await fetch(
        this.pages[page - 1].textUrl
      )).text();
    }
  }
};
</script>

<style scoped>
.shim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background: var(--document-body-bg);
}
</style>
