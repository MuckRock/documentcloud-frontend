<template>
  <div>
    <h2>Redact Document</h2>
    <p>
      Click and drag to draw a black rectangle over each portion of the document
      you'd like to redact. Associated text will be removed when you save your
      redactions.
    </p>
    <div class="actions">
      <Button :secondary="true" @click="$emit('close')">Close</Button>
      <Button
        @click="$editing.redact(id)"
        :disabled="!$editing.redactionsUndoable"
        >Redact</Button
      >
      <Button
        :nondescript="true"
        v-if="$editing.redactionsUndoable"
        @click="$editing.undoRedact()"
        >Undo</Button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
import Button from "@/common/Button";

export default {
  components: { Button },
  data() {
    return {
      id: null
    };
  },
  mounted() {
    const combined = this.$route.params.id;
    this.id = combined.split("-")[0];
  }
};
</script>
