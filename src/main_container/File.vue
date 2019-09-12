<template>
  <div v-if="!uploadMode || !data.done" class="row">
    <div class="cell doc">
      <img svg-inline src="../assets/document.svg" alt draggable="false" />
    </div>
    <div class="cell name" :class="{readonly: uploadMode}">
      <div class="progresscontainer">
        <div class="progress" v-if="uploadMode" :style="{width: `${data.progress * 100}%`}">
          <div class="progressinner">{{name}}</div>
        </div>
      </div>
      <input :readonly="uploadMode" v-model="name" />
    </div>
    <div class="cell size">{{size}}</div>
    <div v-if="uploadMode == false" class="cell close">
      <img
        svg-inline
        @click="$emit('delete')"
        src="../assets/close_inline.svg"
        alt
        draggable="false"
      />
    </div>
  </div>
</template>

<style scoped>
svg {
  user-select: none;
}

.row {
  display: table-row;
}

.cell {
  display: table-cell;
  vertical-align: middle;
  padding: 0.2em 0;
}

input {
  width: 100%;
  box-sizing: border-box;
  border-radius: var(--radius);
  outline: none;
  height: 28px;
  padding: 0 12px;
  background: white;
  border: solid 1px gainsboro;
  font-size: 13px;
  font-family: inherit;
  line-height: 28px;
}

.readonly {
  pointer-events: none;
}

.doc {
  width: 20px;
}

.doc svg {
  vertical-align: middle;
}

.name {
  padding: 0 10px;
}

.size {
  width: 45px;
  color: var(--gray);
  font-size: 12px;
}

.close {
  width: 15px;
}

.close svg {
  cursor: pointer;
}

.close img:hover {
  opacity: var(--hover-opacity);
}

.progresscontainer {
  position: relative;
}

.progress {
  position: absolute;
  height: 28px;
  background: var(--primary);
  border-radius: var(--radius);
  font-size: 13px;
  font-family: inherit;
  line-height: 28px;
  transition: var(--progress-transition);
}

.progressinner {
  padding: 0 0 0 12px;
  color: white;
  overflow-x: hidden;
  white-space: pre;
}
</style>

<script>
function formatBytes(bytes, decimals = 0) {
  // from https://stackoverflow.com/a/18650828/1404888
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function stripExtension(filename) {
  const parts = filename.split(".");
  return parts.slice(0, parts.length - 1).join(".");
}

export default {
  props: { file: File, uploadMode: Boolean, data: Object },
  data() {
    return {
      name: stripExtension(this.file.name)
    };
  },
  mounted() {
    this.updateName();
  },
  watch: {
    name() {
      this.updateName();
    }
  },
  methods: {
    updateName() {
      this.$emit("name", this.name);
    }
  },
  computed: {
    size() {
      return formatBytes(this.file.size);
    }
  }
};
</script>