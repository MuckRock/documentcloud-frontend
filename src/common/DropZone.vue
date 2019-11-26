<template>
  <Draggable
    :class="{ secondary }"
    @upload="$emit('files', $event)"
    class="dropzone"
  >
    <div class="content">
      <slot></slot>
    </div>
  </Draggable>
</template>

<style lang="scss" scoped>
.dropzone {
  width: 100%;
  height: 108px;
  display: table;
  border: dashed 2px $primary;
  background: $primary-faded;
  user-select: none;
  box-sizing: border-box;

  &.secondary {
    border: dashed 2px $secondary;
    background: #e6e6e6;
    height: 65px;
  }

  &.dragging {
    background: $primary;
    border: solid 2px $primary;
    border-radius: $radius;
  }
}

.content {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.secondary .content {
  opacity: 0.7;
  font-size: 15px;
}
</style>

<script>
import Draggable from "./Draggable";

export default {
  components: { Draggable },
  props: { secondary: { type: Boolean, default: false } }
};
</script>
