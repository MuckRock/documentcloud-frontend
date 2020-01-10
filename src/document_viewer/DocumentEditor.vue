<template>
  <div class="editpanel" v-if="$editing.editing">
    <Redactor
      @close="$editing.exitEditing()"
      v-if="$editing.editMode == 'redact'"
    />
  </div>
</template>

<style lang="scss" scoped>
.editpanel {
  background: #fff9f5;
  padding: 1em 1.5em;
  border-bottom: solid 1px #bfbfbf;
  box-shadow: 0 0 2px #00000036;
  color: black;
  position: relative;
  z-index: 1;
  border: solid 4px black;
  position: sticky;
  top: $document-header-height;
}

.actions {
  & ::v-deep > span {
    margin-left: 0.5em;

    &:first-child {
      margin-left: 0;
    }
  }
}
</style>

<script>
import Redactor from "./Redactor";

export default {
  components: { Redactor },
  data() {
    return {
      undoable: false
    };
  }
};
</script>
