<template>
  <span class="container">
    <span class="content" @click="trigger()">
      <slot></slot>
    </span>
    <input
      :multiple="multiselect"
      ref="picker"
      class="picker"
      type="file"
      @change="handleFiles($event)"
    />
  </span>
</template>

<script>
export default {
  data() {
    return {
      hover: false
    };
  },
  props: {
    multiselect: { type: Boolean, default: false }
  },
  methods: {
    trigger() {
      this.$refs.picker.click();
    },
    handleFiles() {
      const fileList = this.$refs.picker.files;
      if (fileList.length > 0) {
        // Clone the file list so the input can be safely cleared
        const files = [];
        for (let i = 0; i < fileList.length; i++) {
          files.push(fileList[i]);
        }
        this.$emit("files", files);
      }
      this.$refs.picker.value = null;
    }
  }
};
</script>

<style scoped>
.container {
  display: inline-block;
  position: relative;
}

.picker {
  display: none;
}

.content {
  display: inline-block;
}
</style>