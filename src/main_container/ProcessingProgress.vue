<template>
  <div>
    <div class="bar">
      <div class="inner" :style="{width: `${doc.processingProgress * 100}%`}"></div>
    </div>
    <p class="status">{{progressMsg}}</p>
  </div>
</template>

<style scoped>
.inner {
  width: 23%;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--primary);
  border-radius: var(--radius);
  transition: var(--progress-transition);
}

.bar {
  height: 18px;
  border-radius: var(--radius);
  width: 100%;
  max-width: 330px;
  background: #e0efff;
  position: relative;
  margin-top: 1em;
}

.status {
  color: var(--gray);
  font-size: 14px;
  margin: 0.5em 0;
}
</style>

<script>
export default {
  props: {
    doc: Object
  },
  computed: {
    progressMsg() {
      if (this.doc.pageCount == 0) {
        return "Extracting document information";
      }

      // Come up with a message
      const parts = [];
      if (this.doc.imagesRemaining > 0) {
        parts.push(
          `processing images (${this.doc.imagesProcessed}/${this.doc.pageCount})`
        );
      }
      if (this.doc.textsRemaining > 0) {
        parts.push(
          `processing text (${this.doc.textsProcessed}/${this.doc.pageCount})`
        );
      }

      if (parts.length == 0) {
        return "Done processing";
      }

      const result = parts.join(", ");
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
  }
};
</script>
