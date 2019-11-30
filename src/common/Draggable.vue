<template>
  <div
    class="outer"
    :class="{ dragging }"
    @dragenter="enter($event)"
    @dragover="enter($event)"
    @dragleave="leave()"
    @drop="handleDrop($event)"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dragging: false
    };
  },
  methods: {
    enter(e) {
      e.preventDefault();
      this.dragging = true;
    },
    leave() {
      this.dragging = false;
    },
    handleDrop(e) {
      e.preventDefault();
      this.handleFiles(e.dataTransfer.files);
    },
    handleFiles(files) {
      this.leave();
      files = Array.from(files).filter(f => f.type == "application/pdf");
      if (files.length == 0) return;
      this.$emit("upload", files);
    }
  }
};
</script>

<style lang="scss" scoped>
.upload {
  height: 150px;
  width: 100%;
  display: table-cell;
  vertical-align: middle;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
  font-weight: bold;
  background: #fffafb;
  color: black;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.outer {
  display: table;
  width: 100%;
  position: relative;
}

input[type="file"] {
  position: absolute;
  left: 0;
  width: 100%;
  top: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;

  &:hover + .upload,
  &.dragging + .upload {
    background: #fc4762;
    color: white;
  }
}
</style>
