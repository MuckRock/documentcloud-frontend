<template>
  <div>
    <DocumentHeader
      @jump="jump($event)"
      @zoom="handleZoom($event)"
      :currentPage="currentPage"
      :numPages="pages.length"
      :doc="doc"
    />
    <DocumentBody
      ref="body"
      :currentPage.sync="currentPage"
      :pages="pages"
      :zoomLevel.sync="zoomLevel"
    />
  </div>
</template>

<script>
import DocumentHeader from "./DocumentHeader";
import DocumentBody from "./DocumentBody";
import { pageSizesFromSpec } from "./pagesize.js";
import Vue from "vue";

const CLOUD_PREFIX = "https://documentcloud-staging-files.s3.amazonaws.com";

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
      zoomLevel: 1000
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
    async getPageSizes() {
      // Get page size information
      const pageSpecUrl = `${CLOUD_PREFIX}/documents/${this.id}/${this.slug}.pagesize`;
      const pageSpec = await (await fetch(pageSpecUrl)).text();
      const pageAspects = pageSizesFromSpec(pageSpec);
      this.pages = pageAspects.map((aspect, i) => ({
        number: i + 1,
        image: `${CLOUD_PREFIX}/documents/${this.id}/pages/${this.slug}-p${i +
          1}-large.gif`,
        aspect: aspect
      }));
    },
    async getDoc() {
      // Get document information
      this.doc = await Vue.API.getDocument(null, this.id);
    }
  }
};
</script>