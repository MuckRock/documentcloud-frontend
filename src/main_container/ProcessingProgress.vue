<template>
  <div>
    <div class="bar">
      <div class="inner" :style="{width: `${processing.progress * 100}%`}"></div>
    </div>
    <p class="status">{{percent}}</p>
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
    percent() {
      if (this.processing.progress < 0.3) {
        return "Extracting document information";
      } else if (this.processing.progress < 0.6) {
        return "Extracting images";
      } else {
        return "Extracting text";
      }
    }
  }
};
</script>