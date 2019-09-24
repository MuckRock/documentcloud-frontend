<template>
  <div class="doc">
    <div class="thumb">
      <PollImage v-if="doc.thumbnail != null" :src="doc.thumbnail" />
    </div>
    <div class="info">
      <h2>{{doc.title}}</h2>
      <p>
        {{doc.contributor}} ({{doc.organization}})
        <br />
        <span v-if="doc.pageCount">{{doc.pageCount}} page{{doc.pageCount == 1 ? '' : 's'}} -</span>
        {{doc.createdAt}}
      </p>
      <ProcessingProgress v-if="!doc.processing.done" :processing="doc.processing" />
      <div v-if="doc.processing.done" class="complete">
        <Button :small="true">Open</Button>
        <p>Processing complete</p>
      </div>
    </div>
  </div>
</template>

<script>
import ProcessingProgress from "./ProcessingProgress";
import Button from "../common/Button";
import PollImage from "../common/PollImage";

export default {
  components: { ProcessingProgress, Button, PollImage },
  props: { doc: Object }
};
</script>

<style scoped>
.doc {
  display: inline-block;
}

img {
  width: 88px;
  height: 112px;
  object-fit: contain;
}

.thumb {
  width: 88px;
  height: 112px;
  background: white;
  outline: 0.5px solid rgba(0, 0, 0, 0.25);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12);
  display: inline-block;
  vertical-align: middle;
  margin: 1em 25px 1em 0;
}

.info {
  display: inline-block;
  vertical-align: middle;
  margin-right: 23px;
}

h2 {
  font-size: 15px;
  font-weight: normal;
  margin: 0.5em 0;
}

p {
  font-size: 14px;
  color: var(--gray);
  margin: 0.5em 0;
}

.complete > p {
  margin: 0;
}
</style>