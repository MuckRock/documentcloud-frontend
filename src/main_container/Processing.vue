<template>
  <div class="processing">
    <h2 v-if="!done">
      Processing {{ processing.length }} document{{
        processing.length == 1 ? "" : "s"
      }}...
    </h2>
    <h2 v-if="done">Processing complete</h2>
    <p v-if="!done">
      Documents will continue to process even if the window is closed
    </p>
    <p v-if="done">
      All documents have finished processing.
      <Button class="hpadded" :nondescript="true" @click="$emit('dismiss')"
        >Dismiss</Button
      >
    </p>
    <div class="docs">
      <div class="fadeout"></div>
      <ProcessingDoc v-for="doc in docs" :key="doc.id" :doc="doc" />
    </div>
  </div>
</template>

<script>
import ProcessingDoc from "./ProcessingDoc";
import Button from "../common/Button";

export default {
  components: { ProcessingDoc, Button },
  props: {
    docs: Array
  },
  computed: {
    processing() {
      return this.docs.filter(doc => !doc.doneProcessing);
    },
    done() {
      return this.processing.length == 0;
    }
  }
};
</script>

<style lang="scss" scoped>
.processing {
  background: $light-primary;
  border-radius: $radius;
  margin-top: 1em;
  padding: 20px 32px;
}

h2 {
  font-weight: 600;
  font-size: 16px;
  margin: 0.5em 0;
}

p {
  font-size: 14px;
  color: $gray;
  margin: 0.5em 0;
}

.docs {
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
  padding: 5px 1px;
  position: relative;
}

.fadeout {
  position: sticky;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100px;
  background: linear-gradient(
    270deg,
    #eff7ff 45.31%,
    rgba(239, 247, 255, 0) 100%
  );
}

.hpadded {
  margin-left: 3px;
}
</style>
