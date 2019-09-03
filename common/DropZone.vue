<template>
  <Draggable class="dropzone">
    <div class="content">Drag and drop files here</div>
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
</style>

<script>
import Draggable from "./Draggable";

export default {
  components: { Draggable }
};
</script>