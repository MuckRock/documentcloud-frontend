<template>
  <div class="mode">
    <div class="modebuttons">
      <div :class="{selected: mode == 'images'}" class="side left" @click="selectMode('images')">
        <img svg-inline src="../assets/document_images.svg" alt />
      </div>
      <div :class="{selected: mode == 'texts'}" class="side right" @click="selectMode('texts')">
        <img svg-inline src="../assets/document_texts.svg" alt />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    mode: String
  },
  methods: {
    selectMode(mode) {
      if (this.mode != mode) {
        this.$emit("mode", mode);
      }
    }
  }
};
</script>

<style scoped>
.mode {
  display: inline-block;
  vertical-align: middle;
}

.modebuttons {
  display: inline-block;
  user-select: none;
  cursor: pointer;
  margin: 0 7px;
}

.modebuttons svg {
  margin: 0 5px;
}

.side {
  display: inline-block;
  padding: 4px 5px;
  background: var(--document-faded);
}

.side.selected {
  background: var(--document-selected);
  cursor: default;
}

.side:hover {
  opacity: var(--hover-opacity);
}

.side.selected:hover {
  opacity: inherit;
}

.left {
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: var(--radius);
}

.right {
  border-top-right-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
}
</style>