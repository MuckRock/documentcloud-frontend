<template>
  <div class="errorcard">
    <p>An error occurred trying to process this document</p>
    <div class="img"><img svg-inline src="../assets/error_icon.svg" /></div>
    <div>
      <Button :small="true" :secondary="true" @click="$emit('retry')"
        >Try again</Button
      >
    </div>
    <div class="padbutton">
      <Button :caution="true" :nondescript="true" @click="$emit('delete')"
        >Delete</Button
      >
    </div>
  </div>
</template>

<script>
import Button from "./Button";

export default {
  components: { Button }
};
</script>

<style lang="scss" scoped>
.errorcard {
  background: $faint-gray;
  text-align: center;
  height: 100%;

  p {
    margin: 0;
    padding: 20px 5px 0 5px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.8);
  }

  .img {
    padding: 13px 0;
  }

  button {
    margin: 0;
  }

  .padbutton {
    margin: 0.3em 0;

    button {
      font-size: 13px;
    }
  }
}
</style>
