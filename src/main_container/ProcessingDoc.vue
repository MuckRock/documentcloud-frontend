<template>
  <Loader :inline="true" :active="doc.loading">
    <div class="doc">
      <div class="thumb" :class="{ error: doc.error }">
        <PollImage
          v-if="!doc.error && doc.mightHaveThumbnail"
          :src="doc.thumbnail"
        />
        <img v-if="doc.error" svg-inline src="../assets/error_icon.svg" />
      </div>
      <div class="info">
        <h2>{{ doc.title }}</h2>
        <p>
          {{ doc.userOrg }}
          <br />
          <span v-if="doc.pageCount"
            >{{ doc.pageCount }} page{{ doc.pageCount == 1 ? "" : "s" }} -</span
          >
          {{ doc.createdAt }}
        </p>
        <ProcessingProgress
          @refreshDoc="$emit('refreshDoc', $event)"
          v-if="doc.pending || doc.linger"
          :doc="doc"
        />
        <div class="buttonpadded" v-if="doc.error">
          <Button :small="true" :secondary="true" @click="$emit('retry', doc)">Try again</Button>
          <Button
            :caution="true"
            :nondescript="true"
            @click="$emit('delete', doc)"
            >Delete</Button
          >
          <p class="errorstatus">
            An error occurred trying to process this document
          </p>
        </div>
        <div class="buttonpadded complete" v-if="doc.successPostLinger">
          <router-link :to="{ name: 'viewer', params: { id: doc.slugId } }"
            ><Button :small="true">Open</Button></router-link
          >
          <Button
            :small="true"
            :secondary="true"
            @click="doc.currentProcessingFinished = false"
            >Dismiss</Button
          >
          <p>Processing complete</p>
        </div>
      </div>
    </div>
  </Loader>
</template>

<script>
import ProcessingProgress from "./ProcessingProgress";
import Button from "../common/Button";
import Loader from "../common/Loader";
import PollImage from "../common/PollImage";

// import Vue from "vue";

export default {
  components: { ProcessingProgress, Button, Loader, PollImage },
  props: { doc: Object },
  watch: {
    "doc.pending"() {
      if (!this.doc.pending && this.doc.success) {
        this.doc.linger = true;
        setTimeout(() => (this.doc.linger = false), 500);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
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
  text-align: center;

  &.error {
    background: $errorbg;
  }

  svg {
    margin-top: 18px;
    width: 42px;
  }
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
  color: $gray;
  margin: 0.5em 0;
}

.buttonpadded {
  > * {
    margin: 0 5px;
  }

  > :first-child {
    margin-left: 0;
  }

  p {
    color: $tertiary;
    margin: 0.5em 0;

    &.errorstatus {
      color: $black;
    }
  }
}

.complete > p {
  margin: 0;
}
</style>
