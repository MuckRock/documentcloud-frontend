<template>
  <div>
    <div class="bar">
      <div class="inner" :style="{width: `${processing.progress * 100}%`}"></div>
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
    processing: Object
  },
  computed: {
    imagesProcessed() {
      if (this.processing.totalPages == 0) return 0;
      return this.processing.totalPages - this.processing.imagesRemaining;
    },
    textsProcessed() {
      if (this.processing.totalPages == 0) return 0;
      return this.processing.totalPages - this.processing.textsRemaining;
    },
    imageProgress() {
      if (this.processing.totalPages == 0) return 0;
      return this.imagesProcessed / this.processing.totalPages;
    },
    textProgress() {
      if (this.processing.totalPages == 0) return 0;
      return this.textsProcessed / this.processing.totalPages;
    },
    progressMsg() {
      if (this.processing.totalPages == 0) {
        return "Extracting document information";
      }

      // Come up with a message
      const parts = [];
      if (this.processing.imagesRemaining > 0) {
        parts.push(
          `processing images (${this.imagesProcessed}/${this.processing.totalPages})`
        );
      }
      if (this.processing.textsRemaining > 0) {
        parts.push(
          `processing text (${this.textsProcessed}/${this.processing.totalPages})`
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
