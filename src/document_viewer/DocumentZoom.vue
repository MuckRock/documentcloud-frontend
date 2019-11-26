<template>
  <div class="zoom">
    <div class="zoombutton" @click="$emit('zoom', 1)">
      <img svg-inline src="../assets/zoom_in.svg" alt />
    </div>
    <div class="zoombutton" @click="$emit('zoom', -1)">
      <img svg-inline src="../assets/zoom_out.svg" alt />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.zoom {
  display: inline-block;
  vertical-align: middle;
}

.zoombutton {
  display: inline-block;
  background: $document-faded;
  padding: 0 12px;
  margin: 0 7px;
  border-radius: $radius;
  cursor: pointer;
  vertical-align: middle;
  height: 27px;
  user-select: none;

  &:hover {
    opacity: $hover-opacity;
  }

  svg {
    vertical-align: middle;
  }
}
</style>
