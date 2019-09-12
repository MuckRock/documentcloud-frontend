<template>
  <Draggable :class="{secondary}" @upload="$emit('files', $event)" class="dropzone">
    <div class="content">
      <slot></slot>
    </div>
  </Draggable>
</template>

<style scoped>
.dropzone {
  width: 100%;
  height: 108px;
  display: table;
  border: dashed 2px var(--primary);
  background: var(--primary-faded);
  user-select: none;
  box-sizing: border-box;
}

.dropzone.secondary {
  border: dashed 2px var(--secondary);
  background: #e6e6e6;
  height: 65px;
}

.dropzone.dragging {
  background: var(--primary);
  border: solid 2px var(--primary);
  border-radius: var(--radius);
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